export type RoleCode = 'C' | 'A' | 'AR' | 'E' | 'SE' | 'PA' | 'AM' | 'AQ' | 'ES' | 'WR' | 'OP' | 'PRF' | string;
export type RightsType = 'pr' | 'mr' | 'sr';
export interface Share {
    rightsType: RightsType;
    value: number;
    society?: string;
}
export interface AgreementNumber {
    source?: string;
    value: string;
}
export interface TerritoryShareType {
    type: 'own' | 'coll';
    shares: Share[];
}
export interface ParticipantTerritory {
    territory: {
        include: string[];
        exclude: string[];
    };
    shareTypes: TerritoryShareType[];
    agreementNumber?: AgreementNumber;
}
export interface Relinquishment {
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
export interface RoleSplit {
    music: number;
    text: number;
}
export interface Participant {
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
export interface RecordingRelease {
    title?: string;
    ean?: string;
    catno?: string;
    identifiers?: WorkIdentifier[];
    label?: string;
    releaseDate?: string;
}
export interface Recording {
    version?: string;
    title?: string;
    isrc?: string;
    releases?: RecordingRelease[];
}
export interface WorkIdentifier {
    source: string;
    value: string;
}
export interface WorkTitle {
    value: string;
    type?: string;
    language?: string;
}
export interface Messages {
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
export interface Flags {
    aiUsage?: string;
    anomalous?: boolean;
    fraudulent?: boolean;
    [k: string]: unknown;
}
export interface Identifiers {
    iswc?: string;
    submitterWorkNumber?: string;
    proprietaryIds?: {
        value: string;
        source?: string;
    }[];
}
export interface CanonicalWork {
    rawRecords?: string[];
    titles?: WorkTitle[];
    identifiers?: WorkIdentifier[];
    messages?: Messages;
    flags?: Flags;
    parties?: Participant[];
    recordings?: Recording[];
}
export interface HdrRecord {
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
export interface ParsedCwrFile {
    header?: HdrRecord;
    works: CanonicalWork[];
}
export interface SchemaV1Messages extends Messages {
    schema: string;
    schemaDescription: string;
}
export interface SchemaV1WorkOutput {
    messages: SchemaV1Messages;
    flags?: Flags;
    titles?: WorkTitle[];
    identifiers?: WorkIdentifier[];
    parties?: Participant[];
    recordings?: Recording[];
}
export interface SchemaV1Output {
    header?: HdrRecord;
    works: SchemaV1WorkOutput[];
}
//# sourceMappingURL=cwr.d.ts.map