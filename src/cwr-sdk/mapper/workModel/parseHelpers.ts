import { presentSocietyCode } from '../../lookups';
import { parseRecordLine } from '../../parser/recordParser';
import type { ShareEntry } from '../territoryUtils';
import type { WorkIdentifier } from '../../types/cwr';
import { formatIswcForValidation } from '../../../validation/normalizeIswc';

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
  | { kind: 'identifier'; identifier: WorkIdentifier };

/** Map CWR XRF (Work ID Cross Reference). Foundational ids leave the generic bag. */
export function mapXrfToIdentifier(obj: Record<string, string>): XrfMapping | null {
  const org = (obj.OrganisationCode || '').trim();
  const id = (obj.Identifier || '').trim();
  if (!id) return null;
  if (org === '000' || org === '099') return null;

  if (org === 'ISW') {
    return { kind: 'iswc', value: formatIswcForValidation(id) || id };
  }
  if (org === 'ISR') return { kind: 'isrc', value: id };

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

export function pushIdentifier(identifiers: WorkIdentifier[], entry: WorkIdentifier) {
  const exists = identifiers.some(
    (i) =>
      i.type === entry.type &&
      i.value === entry.value &&
      i.source?.type === entry.source?.type &&
      i.source?.value === entry.source?.value
  );
  if (!exists) identifiers.push(entry);
}

export function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}
