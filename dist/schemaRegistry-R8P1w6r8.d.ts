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
type IdentifierSourceType = 'ipiNameNumber' | 'cisacSociety' | 'cwrSubmitter' | 'dpid';
interface IdentifierSource {
    type: IdentifierSourceType;
    value: string;
    name?: string;
}
type IdentifierKind = 'publisherWorkId' | 'societyWorkId' | 'submitterWorkId' | 'assetId' | 'proprietary';
interface WorkIdentifier {
    type: IdentifierKind;
    value: string;
    source?: IdentifierSource;
}
interface Tag {
    name: string;
    value: string[];
}
interface RecordingRelease {
    title?: string;
    ean?: string[];
    catno?: string;
    identifiers?: WorkIdentifier[];
    tags?: Tag[];
    label?: string;
    releaseDate?: string;
}
interface Recording {
    version?: string;
    title?: string;
    isrc?: string[];
    identifiers?: WorkIdentifier[];
    tags?: Tag[];
    releases?: RecordingRelease[];
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
        originalRecordSequence?: string;
        recordType?: string;
        messageLevel?: string;
        validationNumber?: string;
    }[];
    creationDate?: string;
    creationTime?: string;
    originalGroupId?: string;
    originalTransactionSequence?: string;
    originalTransactionType?: string;
    creationTitle?: string;
    submitterCreationNumber?: string;
    recipientCreationNumber?: string;
    processingDate?: string;
    transactionStatus?: string;
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
    iswc?: string[];
    isrc?: string[];
    identifiers?: WorkIdentifier[];
    messages?: Messages;
    flags?: Flags;
    parties?: Participant[];
    recordings?: Recording[];
}
interface HeaderConventions {
    writerControl: 'swrOnly' | 'swrOwr';
    publisherShare: 'summed' | 'perWriterChain';
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
    conventions?: HeaderConventions;
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
    iswc?: string[];
    isrc?: string[];
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

export type { HdrRecord as H, Participant as P, Recording as R, SchemaId as S, WorkIdentifier as W, SchemaV1Output as a, HeaderConventions as b, SchemaV1Messages as c, SchemaV1WorkOutput as d, WorkTitle as e };
