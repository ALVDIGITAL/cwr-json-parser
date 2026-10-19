import { presentSocietyCode } from '../cwr-sdk/lookups';
import type { SchemaV1Output } from '../cwr-sdk/types/cwr';
import { formatIswcForValidation } from './normalizeIswc';
import { normalizeTerritoriesOnDocument } from './normalizeTerritories';

export interface NormalizeCwrJsonResult {
  /** Deep-cloned payload with fixes applied for validation. */
  data: SchemaV1Output;
  /** Human-readable notes about automatic fixes (not errors). */
  notes: string[];
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Apply safe, layout-only fixes before JSON Schema validation.
 * Does not mutate the input object.
 */
export function normalizeCwrJson(payload: unknown): NormalizeCwrJsonResult {
  const notes: string[] = [];

  if (!isRecord(payload) || !Array.isArray(payload.works)) {
    return { data: payload as unknown as SchemaV1Output, notes };
  }

  const data = deepClone(payload as unknown as SchemaV1Output);

  data.works.forEach((work, wi) => {
    (work.identifiers || []).forEach((entry, i) => {
      if (!entry || !('iswc' in entry) || !Array.isArray(entry.iswc)) return;
      entry.iswc.forEach((code, j) => {
        const formatted = formatIswcForValidation(code);
        if (formatted && formatted !== code) {
          notes.push(
            `/works/${wi}/identifiers/${i}/iswc/${j}: ISWC "${code}" → "${formatted}" (dotted ISO)`
          );
          entry.iswc[j] = formatted;
        }
      });
    });
  });

  normalizeTerritoriesOnDocument(data.works, notes);
  normalizeShareSocietiesOnDocument(data.works, notes);

  return { data, notes };
}

function normalizeShareSocietiesOnDocument(
  works: SchemaV1Output['works'],
  notes: string[]
): void {
  works.forEach((work, wi) => {
    for (const party of work.parties || []) {
      normalizePartyShareSocieties(party, notes, `/works/${wi}/parties`);
    }
  });
}

function normalizePartyShareSocieties(
  party: NonNullable<SchemaV1Output['works'][number]['parties']>[number],
  notes: string[],
  path: string
): void {
  for (let ti = 0; ti < (party.territories || []).length; ti++) {
    const territory = party.territories![ti];
    for (let sti = 0; sti < (territory.shareTypes || []).length; sti++) {
      const shareType = territory.shareTypes![sti];
      for (let si = 0; si < (shareType.shares || []).length; si++) {
        const share = shareType.shares![si];
        const raw = share.society;
        if (raw === undefined) continue;
        const canonical = presentSocietyCode(raw);
        const sharePath = `${path}/territories/${ti}/shareTypes/${sti}/shares/${si}`;
        if (!canonical) {
          delete share.society;
          notes.push(`${sharePath}: society "${raw}" omitted (no collecting society)`);
        } else if (canonical !== raw) {
          share.society = canonical;
        }
      }
    }
  }

  for (let ri = 0; ri < (party.representedBy || []).length; ri++) {
    normalizePartyShareSocieties(party.representedBy![ri], notes, `${path}/representedBy/${ri}`);
  }
}
