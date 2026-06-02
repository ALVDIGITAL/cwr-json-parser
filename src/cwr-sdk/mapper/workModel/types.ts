import type { ShareEntry, AgreementNumber } from '../territoryUtils';

/** Mutable party node built during phase 1; projected to canonical Participant in phase 2. */
export type PartyNode = {
  role: string;
  name: string;
  ipi: string;
  partyId: string;
  controlled: 'yes' | 'no';
  territories: any[];
  representedBy: PartyNode[];
  _isPublisher?: boolean;
  _ownShares?: ShareEntry[];
  _agreementNumber?: AgreementNumber;
  _publisherSequence?: string;
  roleSplitM?: number;
  roleSplitT?: number;
  relinquishment?: Record<string, unknown>;
  nameDomestic?: string;
  nameScript?: string;
};

export type CollectionTerritoryInput = {
  incl: boolean;
  tis: string[];
  collShares: ShareEntry[];
  agreementNumber?: AgreementNumber;
};

export type PwrLink = {
  writerIp: string;
  pubIp: string;
  publisherSequence: string;
  relinquishment?: Record<string, unknown>;
};

/** SPU/OPU publisher chain keyed by PublisherSequence within a publisher block. */
export type PublisherChain = {
  sequence: string;
  recordSeq: string;
  controlled: 'yes' | 'no';
  /** Top publisher (usually E). */
  party: PartyNode;
};

export type WriterGroup = {
  writer: PartyNode;
  collectionTerritories: CollectionTerritoryInput[];
  pwrLinks: PwrLink[];
};

export type AriRecord = {
  societyCode: string;
  workNumber?: string;
  typeOfRight: string;
  subjectCode?: string;
  note?: string;
};

export type WorkModel = {
  header: Record<string, string | undefined>;
  messages: Record<string, unknown>;
  flags: Record<string, unknown>;
  identifiers: { source: string; value: string }[];
  titles: { value: string; type: string; language?: string }[];
  recordings: any[];
  ariRecords: AriRecord[];
  writerLocalNames: Record<string, { name: string; language?: string }>;
  publisherLocalNames: Record<string, { name: string; language?: string }>;
  /** Submitter publisher block (SPU/SPT). */
  submitterPublisherChains: PublisherChain[];
  /** Other publisher block (OPU/OPT). */
  otherPublisherChains: PublisherChain[];
  /** Controlled writers (SWR/SWT/PWR). */
  controlledWriterGroups: WriterGroup[];
  /** Other writers (OWR/OWT/PWR). */
  otherWriterGroups: WriterGroup[];
};
