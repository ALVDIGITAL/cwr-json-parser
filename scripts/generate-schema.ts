/**
 * Inject lookup enums and validation overlays into cwr-json-schema-v1.0.schema.json.
 * Run after build-lookup-data: npm run schema:generate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = join(root, 'src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json');
const lookupPath = join(root, 'src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json');
const territoryOverlayPath = join(
  root,
  'src/cwr-sdk/json-schemas/participant-territory.overlay.json'
);

const PATTERNS = {
  date8: '^\\d{8}$',
  time6: '^\\d{6}$',
  ipi11: '^\\d{11}$',
  iswc: '^(?:T-\\d{3}\\.\\d{3}\\.\\d{3}-\\d|T\\d{10}|T-\\d{9}-\\d)$',
  isrc: '^[A-Z]{2}[A-Z0-9]{3}\\d{7}$',
  ean13: '^\\d{13}$',
  sharePercent: { minimum: 0, maximum: 100 },
} as const;

type JsonSchema = Record<string, unknown>;

const lookup = JSON.parse(readFileSync(lookupPath, 'utf8')) as {
  sets: Record<string, string[]>;
};
const sets = lookup.sets;
const territoryOverlay = JSON.parse(readFileSync(territoryOverlayPath, 'utf8')) as {
  allOf: unknown[];
};

const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as {
  definitions: Record<string, JsonSchema>;
};

function enumSchema(values: string[]): JsonSchema {
  return { type: 'string', enum: [...values] };
}

function tisItemsSchema(): JsonSchema {
  return { type: 'array', items: { $ref: '#/definitions/TisNumericCode' } };
}

function applyTerritoryTis(def: JsonSchema) {
  const territory = def.properties as Record<string, JsonSchema>;
  const terr = territory.territory as JsonSchema;
  const props = terr.properties as Record<string, JsonSchema>;
  props.include = tisItemsSchema();
  props.exclude = tisItemsSchema();
}

// --- New / updated definitions ---
schema.definitions.TisNumericCode = enumSchema(sets.tisNumericCodes);
schema.definitions.RoleCode = enumSchema(sets.roleCodes);
schema.definitions.RightsType = enumSchema(sets.rightsTypes);
schema.definitions.ControlledFlag = enumSchema(sets.controlled);
schema.definitions.TitleTypeCode = enumSchema(sets.titleTypes);
schema.definitions.IdentifierSource = enumSchema(sets.identifierSources);
schema.definitions.MessageType = enumSchema(sets.messageTypes);
schema.definitions.AiUsageIndicator = enumSchema(sets.aiUsageIndicators);
schema.definitions.CharacterSetCode = enumSchema(sets.characterSets);
schema.definitions.SocietyCode = enumSchema(sets.societyCodes);
schema.definitions.LanguageCode = enumSchema(sets.languageCodes);
schema.definitions.RevocationReasonCode = enumSchema(sets.revocationReasons);
schema.definitions.AnomalousWorkReasonCode = enumSchema(sets.anomalousWorkReasons);

// Share bounds
const share = schema.definitions.Share as JsonSchema;
const shareProps = share.properties as Record<string, JsonSchema>;
shareProps.value = {
  type: 'number',
  ...PATTERNS.sharePercent,
};
shareProps.society = { $ref: '#/definitions/SocietyCode' };

// Participant controlled ref
const participant = schema.definitions.Participant as JsonSchema;
(participant.properties as Record<string, JsonSchema>).controlled = {
  $ref: '#/definitions/ControlledFlag',
};
(participant.properties as Record<string, JsonSchema>).ipi = {
  type: 'string',
  pattern: PATTERNS.ipi11,
};
(participant.properties as Record<string, JsonSchema>).roleSplitM = {
  type: 'number',
  ...PATTERNS.sharePercent,
};
(participant.properties as Record<string, JsonSchema>).roleSplitT = {
  type: 'number',
  ...PATTERNS.sharePercent,
};

// ParticipantTerritory overlay + TIS items
const pt = schema.definitions.ParticipantTerritory as JsonSchema;
applyTerritoryTis(pt);
pt.allOf = territoryOverlay.allOf;

// Relinquishment dates + TIS
const rel = schema.definitions.Relinquishment as JsonSchema;
(rel.properties as Record<string, JsonSchema>).effectiveFrom = {
  type: 'string',
  pattern: PATTERNS.date8,
};
(rel.properties as Record<string, JsonSchema>).postTermCollectionUntil = {
  type: 'string',
  pattern: PATTERNS.date8,
};
const scope = (rel.properties as Record<string, JsonSchema>).scope as JsonSchema;
const scopeTerr = (scope.properties as Record<string, JsonSchema>).territories as JsonSchema;
const scopeTerrProps = scopeTerr.properties as Record<string, JsonSchema>;
scopeTerrProps.include = tisItemsSchema();
scopeTerrProps.exclude = tisItemsSchema();

// HdrRecord
const hdr = schema.definitions.HdrRecord as JsonSchema;
const hdrProps = hdr.properties as Record<string, JsonSchema>;
hdrProps.creationDate = { type: 'string', pattern: PATTERNS.date8 };
hdrProps.creationTime = { type: 'string', pattern: PATTERNS.time6 };
hdrProps.transmissionDate = { type: 'string', pattern: PATTERNS.date8 };
hdrProps.characterSet = { $ref: '#/definitions/CharacterSetCode' };

schema.definitions.Conventions = {
  additionalProperties: false,
  properties: {
    publisherShare: { type: 'string', enum: ['summed', 'perWriterChain'] },
    writerControl: { type: 'string', enum: ['swrOnly', 'swrOwr'] },
  },
  required: ['publisherShare', 'writerControl'],
  type: 'object',
};
hdrProps.conventions = { $ref: '#/definitions/Conventions' };

// Flags
const flags = schema.definitions.Flags as JsonSchema;
const flagsProps = flags.properties as Record<string, JsonSchema>;
flagsProps.aiUsage = { $ref: '#/definitions/AiUsageIndicator' };
flagsProps.anomalousReason = { $ref: '#/definitions/AnomalousWorkReasonCode' };

// Messages.type + revocation.reason
const messages = schema.definitions.Messages as JsonSchema;
const messagesProps = messages.properties as Record<string, JsonSchema>;
messagesProps.type = { $ref: '#/definitions/MessageType' };
const revocation = messagesProps.revocation as JsonSchema;
(revocation.properties as Record<string, JsonSchema>).reason = {
  $ref: '#/definitions/RevocationReasonCode',
};

// WorkTitle.type + language
const workTitle = schema.definitions.WorkTitle as JsonSchema;
const workTitleProps = workTitle.properties as Record<string, JsonSchema>;
workTitleProps.type = { $ref: '#/definitions/TitleTypeCode' };
workTitleProps.language = { $ref: '#/definitions/LanguageCode' };

function stringArray(pattern?: string): JsonSchema {
  const items: JsonSchema = { type: 'string' };
  if (pattern) items.pattern = pattern;
  return { type: 'array', items };
}

schema.definitions.IdentifierNamespace = {
  additionalProperties: false,
  type: 'object',
  required: ['type', 'value'],
  properties: {
    type: {
      type: 'string',
      enum: ['ipiNameNumber', 'cisacSociety', 'cwrSubmitter', 'dpid'],
    },
    value: { type: 'string' },
    name: { type: 'string' },
  },
};

schema.definitions.Tag = {
  additionalProperties: false,
  type: 'object',
  required: ['name', 'value'],
  properties: {
    name: { type: 'string', minLength: 1 },
    value: {
      type: 'array',
      minItems: 1,
      items: { type: 'string', minLength: 1 },
    },
  },
};

schema.definitions.WorkIdentifier = {
  additionalProperties: false,
  type: 'object',
  required: ['type', 'value'],
  properties: {
    type: {
      type: 'string',
      enum: ['publisherWorkId', 'societyWorkId', 'submitterWorkId', 'assetId', 'proprietary'],
    },
    value: { type: 'string' },
    source: { $ref: '#/definitions/IdentifierNamespace' },
  },
};

for (const defName of ['CanonicalWork', 'SchemaV1WorkOutput'] as const) {
  const props = (schema.definitions[defName] as JsonSchema).properties as Record<string, JsonSchema>;
  props.iswc = stringArray(PATTERNS.iswc);
  props.isrc = stringArray(PATTERNS.isrc);
}

const recording = schema.definitions.Recording as JsonSchema;
const recordingProps = recording.properties as Record<string, JsonSchema>;
recordingProps.isrc = stringArray(PATTERNS.isrc);
recordingProps.identifiers = {
  type: 'array',
  items: { $ref: '#/definitions/WorkIdentifier' },
};
recordingProps.tags = {
  type: 'array',
  items: { $ref: '#/definitions/Tag' },
};

const release = schema.definitions.RecordingRelease as JsonSchema;
const releaseProps = release.properties as Record<string, JsonSchema>;
releaseProps.ean = stringArray(PATTERNS.ean13);
releaseProps.tags = {
  type: 'array',
  items: { $ref: '#/definitions/Tag' },
};
(release.properties as Record<string, JsonSchema>).releaseDate = {
  type: 'string',
  pattern: PATTERNS.date8,
};

writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
console.log(`Updated ${schemaPath}`);
