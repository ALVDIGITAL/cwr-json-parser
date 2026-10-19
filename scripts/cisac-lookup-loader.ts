/**
 * Load CISAC CWR 2.x lookup tables from bundled JSON (index + per-table files).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CISAC_LOOKUP_DIR = join(
  root,
  'src/cwr-sdk/lookups/data/cisac-cwr08-3615r2_cwr_2x_lookup_2026-03-31_en'
);

export type CisacLookupEntry = {
  code: string;
  description?: string;
  definition?: string | null;
  other?: string | null;
};

export type CisacLookupTable = {
  slug: string;
  tableName: string;
  entries: CisacLookupEntry[];
};

export type CisacLookupIndex = {
  sourceFile: string;
  generatedAt: string;
  tableCount: number;
  tables: { slug: string; tableName: string; file: string; entryCount: number }[];
};

let indexCache: CisacLookupIndex | null = null;
const tableCache = new Map<string, CisacLookupTable>();

export function loadCisacIndex(dir = CISAC_LOOKUP_DIR): CisacLookupIndex {
  if (indexCache) return indexCache;
  const raw = readFileSync(join(dir, 'index.json'), 'utf8');
  indexCache = JSON.parse(raw) as CisacLookupIndex;
  return indexCache;
}

export function loadCisacTable(slug: string, dir = CISAC_LOOKUP_DIR): CisacLookupTable {
  const cached = tableCache.get(slug);
  if (cached) return cached;

  const index = loadCisacIndex(dir);
  const meta = index.tables.find((t) => t.slug === slug);
  if (!meta) {
    throw new Error(`Unknown CISAC lookup table slug: ${slug}`);
  }

  const raw = readFileSync(join(dir, meta.file), 'utf8');
  const table = JSON.parse(raw) as CisacLookupTable;
  tableCache.set(slug, table);
  return table;
}

export function loadCisacCodes(slug: string, dir = CISAC_LOOKUP_DIR): string[] {
  const table = loadCisacTable(slug, dir);
  const codes = table.entries.map((e) => e.code).filter((c) => c.length > 0);
  return [...new Set(codes)].sort((a, b) => a.localeCompare(b));
}

/** Kebab slug → camelCase set name with Codes suffix when needed. */
export function slugToSetName(slug: string): string {
  const camel = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  if (/^(.*)(Codes|Types|Indicators|Reasons|Sets)$/.test(camel)) return camel;
  return `${camel}Codes`;
}

export function loadAllCisacSets(dir = CISAC_LOOKUP_DIR): Record<string, string[]> {
  const index = loadCisacIndex(dir);
  const out: Record<string, string[]> = {};
  for (const { slug } of index.tables) {
    out[slugToSetName(slug)] = loadCisacCodes(slug, dir);
  }
  return out;
}
