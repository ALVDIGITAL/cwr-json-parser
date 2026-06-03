import {
  hasTisCode,
  isPublisherRole,
  isSubPublisherRole,
} from '../cwr-sdk/lookups';
import type { SchemaV1Output } from '../cwr-sdk/types/cwr';

export type SemanticRuleId =
  | 'TIS_OVERLAP'
  | 'OWN_EMPTY_TIS'
  | 'SUBPUB_NO_OWN'
  | 'PUB_OWN_E_ONLY'
  | 'ID_UNIQUE_SUBMITTER'
  | 'TIS_UNKNOWN';

type PartyContext = {
  workIndex: number;
  path: string;
  role: string;
};

function formatError(path: string, rule: SemanticRuleId, message: string): string {
  return `${path} [${rule}]: ${message}`;
}

function territoryHasOwn(territoryEntry: {
  shareTypes?: { type?: string }[];
}): boolean {
  return (territoryEntry.shareTypes || []).some((st) => st.type === 'own');
}

function checkTerritoryEntry(
  territoryEntry: {
    territory?: { include?: string[]; exclude?: string[] };
    shareTypes?: { type?: string }[];
  },
  ctx: PartyContext,
  errors: string[],
  territoryIndex: number
) {
  const base = `${ctx.path}/territories/${territoryIndex}`;
  const include = territoryEntry.territory?.include || [];
  const exclude = territoryEntry.territory?.exclude || [];
  const hasOwn = territoryHasOwn(territoryEntry);

  if (hasOwn) {
    if (include.length > 0 || exclude.length > 0) {
      errors.push(
        formatError(
          base,
          'OWN_EMPTY_TIS',
          'ownership (own) must not use TIS include/exclude; both arrays must be empty'
        )
      );
    }
  }

  const overlap = include.filter((c) => exclude.includes(c));
  if (overlap.length > 0) {
    errors.push(
      formatError(
        base,
        'TIS_OVERLAP',
        `TIS code(s) appear in both include and exclude: ${overlap.join(', ')}`
      )
    );
  }

  for (const code of [...include, ...exclude]) {
    if (code && !hasTisCode(code)) {
      errors.push(
        formatError(base, 'TIS_UNKNOWN', `unknown TIS numeric code: ${code}`)
      );
    }
  }

  if (hasOwn && isSubPublisherRole(ctx.role)) {
    errors.push(
      formatError(
        base,
        'SUBPUB_NO_OWN',
        `role ${ctx.role} must not have shareTypes type "own" (sub-publishers are collection-only)`
      )
    );
  } else if (hasOwn && isPublisherRole(ctx.role) && ctx.role !== 'E') {
    errors.push(
      formatError(
        base,
        'PUB_OWN_E_ONLY',
        `publisher role ${ctx.role} must not have ownership (own); only original publisher (E) may`
      )
    );
  }
}

function walkParty(
  party: {
    role: string;
    territories?: Parameters<typeof checkTerritoryEntry>[0][];
    representedBy?: typeof party[];
  },
  ctx: PartyContext,
  errors: string[]
) {
  const territories = party.territories || [];
  territories.forEach((entry, ti) => checkTerritoryEntry(entry, ctx, errors, ti));

  const reps = party.representedBy || [];
  reps.forEach((child, ri) => {
    walkParty(child, { ...ctx, path: `${ctx.path}/representedBy/${ri}`, role: child.role }, errors);
  });
}

function collectSubmitterIds(payload: SchemaV1Output): Map<string, number[]> {
  const map = new Map<string, number[]>();
  payload.works.forEach((work, wi) => {
    for (const id of work.identifiers || []) {
      if (id.source !== 'submitterWorkNumber' || !id.value) continue;
      const list = map.get(id.value) || [];
      list.push(wi);
      map.set(id.value, list);
    }
  });
  return map;
}

/**
 * Cross-field and file-level rules not expressible in JSON Schema alone.
 */
export function validateCwrJsonSemantic(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object' || !('works' in payload)) {
    return [];
  }

  const doc = payload as SchemaV1Output;
  if (!Array.isArray(doc.works)) {
    return [];
  }
  const errors: string[] = [];

  doc.works.forEach((work, wi) => {
    const parties = work.parties || [];
    parties.forEach((party, pi) => {
      const ctx: PartyContext = {
        workIndex: wi,
        path: `/works/${wi}/parties/${pi}`,
        role: party.role,
      };
      walkParty(party, ctx, errors);
    });
  });

  const submitterMap = collectSubmitterIds(doc);
  for (const [value, workIndices] of submitterMap) {
    const unique = [...new Set(workIndices)];
    if (unique.length > 1) {
      errors.push(
        formatError(
          '/',
          'ID_UNIQUE_SUBMITTER',
          `duplicate submitterWorkNumber "${value}" in works: ${unique.map((i) => i.toString()).join(', ')}`
        )
      );
    }
  }

  return errors;
}
