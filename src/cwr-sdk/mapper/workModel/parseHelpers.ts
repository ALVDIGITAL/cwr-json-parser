import { parseRecordLine } from '../../parser/recordParser';
import type { ShareEntry } from '../territoryUtils';

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
  const pushShare = (rightsType: 'pr' | 'mr' | 'sr', val?: number) => {
    if (val !== undefined && !Number.isNaN(val)) {
      shares.push({ rightsType, value: val, society: defaultSociety });
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
