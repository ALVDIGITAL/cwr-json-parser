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
    for (const id of work.identifiers || []) {
      if (id.source !== 'iswc' || !id.value) continue;
      const formatted = formatIswcForValidation(id.value);
      if (formatted && formatted !== id.value) {
        notes.push(
          `/works/${wi}/identifiers: ISWC "${id.value}" → "${formatted}" (display format)`
        );
        id.value = formatted;
      }
    }
  });

  normalizeTerritoriesOnDocument(data.works, notes);

  return { data, notes };
}
