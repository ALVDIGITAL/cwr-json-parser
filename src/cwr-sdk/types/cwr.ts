// Canonical, schema-agnostic representation of a parsed CWR file.
// This keeps CWR semantics but uses human-readable names and hierarchy.

export type RoleCode =
  | 'C'   // Compositeur
  | 'A'   // Auteur
  | 'AR'  // Arrangeur
  | 'E'   // Éditeur
  | 'SE'  // Sous-Éditeur
  | 'PA'  // Participant au revenu (income participant)
  | 'AM'  // Administrateur
  | 'AQ'  // Acquéreur
  | 'ES'  // Éditeur (société)
  | 'WR'  // Writer (generic, if needed)
  | 'OP'  // Other publisher (generic)
  | 'PRF' // Performing artist (if needed for REC context)
  | string; // allow extension

export type RightsType = 'pr' | 'mr' | 'sr';

export interface Share {
  rightsType: RightsType;
  value: number;          // percentage (0-100)
  society?: string;       // society code (e.g., "035")
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
  effectiveFrom: string;              // date in CWR format YYYYMMDD
  postTermCollectionUntil?: string;   // optional PTC date - collection allowed until this date
  scope: {
    rightsTypes: RightsType[];        // which rights are relinquished: pr, mr, sr
    territories: {
      include: string[];
      exclude: string[];
    };
  };
  note?: string;                      // human-readable explanation
}

// RoleSplit: for CA writers, music and text percentages (0-100).
// Derived from GEMA GW ARI records in CWR EDI.
export interface RoleSplit {
  music: number;  // M percentage (e.g., 57.00)
  text: number;   // T percentage (e.g., 43.00)
}

export interface Participant {
  role: RoleCode;
  roleName?: string;
  name?: string;
  ipi?: string;
  partyId?: string;
  controlled?: "yes" | "no";
  nameDomestic?: string;    // Non-Roman alphabet name (from NWN/NOW/NPN records)
  nameScript?: string;      // Language/script code for nameDomestic (e.g., "JA", "ZH", "KO")
  relinquishment?: Relinquishment; // CWR 2.2 Rev3 (PWR) — E publisher stops representing writer for specified scope
  agreementNumber?: AgreementNumber; // submitter agreement number (especially for SE subpublishers)
  shares?: Share[];
  territories?: ParticipantTerritory[];
  roleSplitM?: number;      // for CA writers: music/composer % (from GEMA GW ARI)
  roleSplitT?: number;      // for CA writers: text/author % (from GEMA GW ARI)
  representedBy?: Participant[]; // for ownership chains (writer -> publisher -> sub-publisher)
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
  type?: string;     // CWR title type (TT, NAT, ALT, etc.)
  language?: string; // ISO language code (e.g., "JA", "ZH", "KO")
}

export interface Messages {
  type?: string; // nwr, rev, etc.
  revocation?: { indicator: string; reason?: string };
  relinquishment?: { indicator: string };
  changeRequest?: Record<string, unknown>;
  msgs?: { status?: string; message?: string }[]; // MSG records from ACK files
  societySpecific?: Record<string, unknown>;
  schema?: string;
  schemaDescription?: string;
  /** Preview / society layers may add labels here; parser may add more fields over time */
  [key: string]: unknown;
}

export interface Flags {
  aiUsage?: string;    // e.g., M/T/B/...
  anomalous?: boolean;
  fraudulent?: boolean;
  [k: string]: unknown;
}

export interface Identifiers {
  iswc?: string;
  submitterWorkNumber?: string;
  proprietaryIds?: { value: string; source?: string }[];
}

export interface CanonicalWork {
  rawRecords?: string[]; // for debugging
  titles?: WorkTitle[];
  identifiers?: WorkIdentifier[];
  messages?: Messages;
  flags?: Flags;
  parties?: Participant[];          // OWN% chains starting at parties
  recordings?: Recording[];                                // Works -> Recordings -> Releases
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
