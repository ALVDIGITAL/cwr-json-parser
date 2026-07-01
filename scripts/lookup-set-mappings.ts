/**
 * CISAC slug → runtime lookup set mappings (merge rules + manual CWR-JSON sets).
 */
import { societyCodeVariants } from '../src/cwr-sdk/lookups/societyCodeVariants.ts';
import { loadCisacCodes } from './cisac-lookup-loader.ts';

export type LookupMapping = {
  cisac: string[];
  extra?: string[];
};

/** Validation sets built from CISAC with optional CWR-JSON extensions. */
export const LOOKUP_MAPPINGS: Record<string, LookupMapping> = {
  roleCodes: {
    cisac: ['writer-designation', 'publisher-type'],
    extra: ['WR', 'OP', 'PRF'],
  },
  titleTypes: {
    cisac: ['title-type'],
    extra: ['ALT', 'NAT', 'UT'],
  },
  aiUsageIndicators: {
    cisac: ['ai-indicator'],
    extra: ['B', 'N', 'U', 'Y'],
  },
  characterSets: { cisac: ['character-set'] },
  revocationReasons: { cisac: ['revocation-reason'] },
  anomalousWorkReasons: { cisac: ['anomalous-work-reason'] },
  societyCodes: {
    cisac: ['cisac-society-code'],
    extra: ['99', '099'],
  },
  languageCodes: { cisac: ['cis-language-code'] },
};

/** CWR-JSON canonical sets — not sourced from CISAC tables. */
export const MANUAL_SETS: Record<string, string[]> = {
  rightsTypes: ['pr', 'mr', 'sr'],
  shareTypes: ['own', 'coll'],
  controlled: ['yes', 'no'],
  identifierSources: ['iswc', 'isrc', 'submitterWorkNumber', 'proprietary', 'ean', 'catalogNumber'],
  messageTypes: ['nwr', 'rev'],
};

/** Work-level identifier sources: canonical names + CISAC society codes (Q0 B / XRF). */
export function buildIdentifierSources(mappedSets: Record<string, string[]>): string[] {
  const set = new Set(MANUAL_SETS.identifierSources);
  for (const code of mappedSets.societyCodes ?? []) {
    set.add(code);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function buildMappedSet(mapping: LookupMapping): string[] {
  const set = new Set<string>();
  for (const slug of mapping.cisac) {
    for (const code of loadCisacCodes(slug)) {
      if (slug === 'cisac-society-code') {
        for (const v of societyCodeVariants(code)) set.add(v);
      } else {
        set.add(code);
      }
    }
  }
  for (const code of mapping.extra ?? []) {
    if (mapping.cisac.includes('cisac-society-code')) {
      for (const v of societyCodeVariants(code)) set.add(v);
    } else {
      set.add(code);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function buildAllMappedSets(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, mapping] of Object.entries(LOOKUP_MAPPINGS)) {
    out[name] = buildMappedSet(mapping);
  }
  return out;
}

/** Slugs consumed by LOOKUP_MAPPINGS (skip when adding reference-only sets). */
export function coveredCisacSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const mapping of Object.values(LOOKUP_MAPPINGS)) {
    for (const slug of mapping.cisac) slugs.add(slug);
  }
  return slugs;
}

export function deriveRoleSubsets(roleCodes: string[]): {
  writerRoles: string[];
  publisherRoles: string[];
  subPublisherRoles: string[];
} {
  const writerDesignation = new Set(loadCisacCodes('writer-designation'));
  const publisherType = new Set(loadCisacCodes('publisher-type'));

  const writerRoles = roleCodes.filter(
    (r) => writerDesignation.has(r) || r === 'WR' || r === 'PRF'
  );
  const publisherRoles = roleCodes.filter((r) => publisherType.has(r) || r === 'OP');
  const subPublisherRoles = roleCodes.filter((r) => ['SE', 'AM', 'PA'].includes(r));

  return { writerRoles, publisherRoles, subPublisherRoles };
}
