import { presentSocietyCode } from '../../lookups';
import { parseRecordLine } from '../../parser/recordParser';
import type { ShareEntry } from '../territoryUtils';
import type { WorkIdentifier, WorkIdentifierEntry } from '../../types/cwr';
import { isIswcIdentifier } from '../../types/cwr';
import { formatIswcForValidation } from '../../../validation/normalizeIswc';

const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;
const EAN_PATTERN = /^\d{13}$/;

export function lineToObj(line: string): Record<string, string> {
  const parsed = parseRecordLine(line) as any;
  const fields = parsed?.fields || parsed;
  if (!Array.isArray(fields)) return {};
  return fields.reduce((acc: Record<string, string>, f: any) => {
    acc[f.label] = (f.value ?? '').trim();
    return acc;
  }, {});
}

export function parseShares(
  obj: Record<string, string>,
  prKey: string,
  mrKey: string,
  srKey: string,
  defaultSociety?: string
): ShareEntry[] {
  const shares: ShareEntry[] = [];
  const toVal = (v?: string) => {
    if (!v || !v.trim()) return undefined;
    const num = parseFloat(v) / 100;
    return parseFloat(num.toFixed(2));
  };
  const society = presentSocietyCode(defaultSociety);
  const pushShare = (rightsType: 'pr' | 'mr' | 'sr', val?: number) => {
    if (val !== undefined && !Number.isNaN(val)) {
      shares.push(society ? { rightsType, value: val, society } : { rightsType, value: val });
    }
  };
  pushShare('pr', toVal(obj[prKey]));
  pushShare('mr', toVal(obj[mrKey]));
  pushShare('sr', toVal(obj[srKey]));
  return shares;
}

export function normalizePartyKey(value?: string) {
  return (value || '').trim().replace(/^0+/, '');
}

export function normalizeSequenceKey(seq?: string) {
  const raw = (seq || '').trim();
  if (!raw) return '';
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return raw;
  return String(n).padStart(2, '0');
}

export function isPublisherOwnEligible(role?: string) {
  return (role || '').trim() === 'E';
}

export type XrfMapping =
  | { kind: 'iswc'; value: string }
  | { kind: 'isrc'; value: string }
  | { kind: 'ean'; value: string }
  | { kind: 'identifier'; identifier: WorkIdentifier };

/** Map CWR XRF. IdentifierType picks the node. OrganisationCode picks the work-id kind. */
export function mapXrfToIdentifier(obj: Record<string, string>): XrfMapping | null {
  const org = (obj.OrganisationCode || '').trim();
  const id = (obj.Identifier || '').trim();
  const idType = (obj.IdentifierType || '').trim().toUpperCase();
  if (!id) return null;
  if (org === '000' || org === '099') return null;
  if (idType === 'V') return null;

  if (idType === 'R') {
    return ISRC_PATTERN.test(id) ? { kind: 'isrc', value: id } : null;
  }
  if (idType === 'P') {
    return EAN_PATTERN.test(id) ? { kind: 'ean', value: id } : null;
  }
  if (idType !== 'W') return null;

  if (org === 'ISW') {
    return { kind: 'iswc', value: formatIswcForValidation(id) || id };
  }

  if (/^\d+$/.test(org)) {
    return {
      kind: 'identifier',
      identifier: {
        type: 'societyWorkId',
        value: id,
        source: { type: 'cisacSociety', value: org },
      },
    };
  }

  if (/^[A-Za-z]{2,3}$/.test(org)) {
    return {
      kind: 'identifier',
      identifier: {
        type: 'publisherWorkId',
        value: id,
        source: { type: 'cwrSubmitter', value: org.toUpperCase() },
      },
    };
  }

  return { kind: 'identifier', identifier: { type: 'proprietary', value: id } };
}

export function pushIdentifier(identifiers: WorkIdentifierEntry[], entry: WorkIdentifier) {
  const exists = identifiers.some(
    (i) =>
      !isIswcIdentifier(i) &&
      i.type === entry.type &&
      i.value === entry.value &&
      i.source?.type === entry.source?.type &&
      i.source?.value === entry.source?.value
  );
  if (!exists) identifiers.push(entry);
}

export function pushIswc(identifiers: WorkIdentifierEntry[], value: string) {
  let bucket = identifiers.find(isIswcIdentifier);
  if (!bucket) {
    bucket = { iswc: [] };
    identifiers.push(bucket);
  }
  pushUnique(bucket.iswc, value);
}

export function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}
