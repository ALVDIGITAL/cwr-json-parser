type RoleCode = 'C' | 'A' | 'CA' | 'AR' | 'E' | 'SE' | 'PA' | 'AM' | 'AQ' | 'ES' | 'WR' | 'OP' | 'PRF';
type RightsType = 'pr' | 'mr' | 'sr';
interface Share {
    rightsType: RightsType;
    value: number;
    society?: string;
}
interface AgreementNumber {
    source?: string;
    value: string;
}
interface TerritoryShareType {
    type: 'own' | 'coll';
    shares: Share[];
}
interface ParticipantTerritory {
    territory: {
        include: string[];
        exclude: string[];
    };
    shareTypes: TerritoryShareType[];
    agreementNumber?: AgreementNumber;
}
interface Relinquishment {
    effectiveFrom: string;
    postTermCollectionUntil?: string;
    scope: {
        rightsTypes: RightsType[];
        territories: {
            include: string[];
            exclude: string[];
        };
    };
    note?: string;
}
interface Participant {
    role: RoleCode;
    roleName?: string;
    name?: string;
    ipi?: string;
    partyId?: string;
    controlled?: "yes" | "no";
    nameDomestic?: string;
    nameScript?: string;
    relinquishment?: Relinquishment;
    agreementNumber?: AgreementNumber;
    shares?: Share[];
    territories?: ParticipantTerritory[];
    roleSplitM?: number;
    roleSplitT?: number;
    representedBy?: Participant[];
}
interface RecordingRelease {
    title?: string;
    ean?: string;
    catno?: string;
    identifiers?: WorkIdentifier[];
    label?: string;
    releaseDate?: string;
}
interface Recording {
    version?: string;
    title?: string;
    isrc?: string;
    releases?: RecordingRelease[];
}
interface WorkIdentifier {
    source: string;
    value: string;
}
interface WorkTitle {
    value: string;
    type?: string;
    language?: string;
}
interface Messages {
    type?: string;
    revocation?: {
        indicator: string;
        reason?: string;
    };
    relinquishment?: {
        indicator: string;
    };
    changeRequest?: Record<string, unknown>;
    msgs?: {
        status?: string;
        message?: string;
    }[];
    societySpecific?: Record<string, unknown>;
    schema?: string;
    schemaDescription?: string;
    /** Preview / society layers may add labels here; parser may add more fields over time */
    [key: string]: unknown;
}
interface Flags {
    aiUsage?: string;
    anomalous?: boolean;
    fraudulent?: boolean;
    [k: string]: unknown;
}
interface CanonicalWork {
    rawRecords?: string[];
    titles?: WorkTitle[];
    identifiers?: WorkIdentifier[];
    messages?: Messages;
    flags?: Flags;
    parties?: Participant[];
    recordings?: Recording[];
}
interface HdrRecord {
    senderIdentifier?: string;
    senderName?: string;
    creationDate?: string;
    creationTime?: string;
    transmissionDate?: string;
    characterSet?: string;
    version?: string;
    revision?: string;
    softwarePackage?: string;
    softwarePackageVersion?: string;
}
interface ParsedCwrFile {
    header?: HdrRecord;
    works: CanonicalWork[];
}
interface SchemaV1Messages extends Messages {
    schema: string;
    schemaDescription: string;
}
interface SchemaV1WorkOutput {
    messages: SchemaV1Messages;
    flags?: Flags;
    titles?: WorkTitle[];
    identifiers?: WorkIdentifier[];
    parties?: Participant[];
    recordings?: Recording[];
}
interface SchemaV1Output {
    header?: HdrRecord;
    works: SchemaV1WorkOutput[];
}

interface CwrSchemaDefinition {
    $schema: string;
    $id: string;
    title: string;
    [key: string]: unknown;
}
interface CwrJsonSchema<TOutput> {
    id: string;
    label: string;
    description: string;
    version: string;
    jsonSchema: CwrSchemaDefinition;
    convert(parsed: ParsedCwrFile): TOutput;
}

/** Single public schema in the Playground; same converter output as Schema A. */
declare const jsonSchemaRegistry: CwrJsonSchema<unknown>[];
type SchemaId = typeof jsonSchemaRegistry[number]['id'];

export type { HdrRecord as H, Participant as P, Recording as R, SchemaId as S, WorkIdentifier as W, SchemaV1Output as a, SchemaV1Messages as b, SchemaV1WorkOutput as c, WorkTitle as d };
