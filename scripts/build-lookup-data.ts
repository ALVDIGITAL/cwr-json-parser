/**

 * Build cwr_lookup_data_types_v1.0_r0.json (role/title/TIS sets + metadata).

 * Run: npx tsx scripts/build-lookup-data.ts [path-to-TIS.xlsx]

 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

import { dirname, join } from 'node:path';

import { fileURLToPath } from 'node:url';

import {

  loadAllCisacSets,

  loadCisacIndex,

  slugToSetName,

} from './cisac-lookup-loader.ts';

import {

  MANUAL_SETS,

  buildAllMappedSets,

  buildIdentifierSources,

  coveredCisacSlugs,

  deriveRoleSubsets,

} from './lookup-set-mappings.ts';

import { CISAC_TIS_GROUP_CODES } from '../src/cwr-sdk/lookups/cisacGroups.ts';

import { tisCodeVariants } from '../src/cwr-sdk/lookups/tisCodeVariants.ts';

import { parseTisXlsx, resolveTisExportPath } from './parse-tis-xlsx.ts';



const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const outPath = join(root, 'src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json');

const isoPath = join(root, 'src/cwr-sdk/lookups/data/iso3166-slim-2.json');



const cliTisPath = process.argv[2];



const ISO_SLIM2_URL =

  'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json';



async function loadIsoNumericCodes(): Promise<string[]> {

  let raw: string | null = null;

  try {

    raw = readFileSync(isoPath, 'utf8');

  } catch {

    try {

      const res = await fetch(ISO_SLIM2_URL);

      if (res.ok) {

        raw = await res.text();

        mkdirSync(dirname(isoPath), { recursive: true });

        writeFileSync(isoPath, raw, 'utf8');

      }

    } catch (e) {

      console.warn('Warning: could not fetch ISO 3166 slim-2:', e);

    }

  }

  if (!raw) return [];

  const rows = JSON.parse(raw.replace(/^\uFEFF/, '')) as { 'country-code': string }[];

  const codes: string[] = [];

  for (const row of rows) {

    codes.push(...tisCodeVariants(row['country-code']));

  }

  return codes;

}



async function buildTisNumericCodes(): Promise<{

  codes: string[];

  source: string;

  tisEntryCount?: number;

}> {

  const tisPath = resolveTisExportPath(cliTisPath);

  try {

    const { rows, numericCodes } = parseTisXlsx(tisPath, 'en');

    console.log(`Loaded ${rows.length} TIS entries from ${tisPath} → ${numericCodes.length} validation strings`);

    return {

      codes: numericCodes,

      source: `CISAC TIS database export (CISAC-TIS.xlsx, sheet en, ${rows.length} territories)`,

      tisEntryCount: rows.length,

    };

  } catch (e) {

    console.warn(`TIS xlsx not used (${e instanceof Error ? e.message : e}); falling back to ISO 3166 + CISAC groups`);

  }



  const set = new Set<string>();

  for (const g of CISAC_TIS_GROUP_CODES) {

    for (const v of tisCodeVariants(g)) set.add(v);

  }

  for (const c of await loadIsoNumericCodes()) set.add(c);

  const codes = [...set].sort((a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b));

  return {

    codes,

    source: 'CISAC TIS09-1540R1a (groups) + ISO 3166-1 numeric (countries/territories)',

  };

}



const cisacIndex = loadCisacIndex();

const mappedSets = buildAllMappedSets();

const { writerRoles, publisherRoles, subPublisherRoles } = deriveRoleSubsets(mappedSets.roleCodes);



const covered = coveredCisacSlugs();

const referenceSets: Record<string, string[]> = {};

for (const [setName, codes] of Object.entries(loadAllCisacSets())) {

  const slug = cisacIndex.tables.find((t) => slugToSetName(t.slug) === setName)?.slug;

  if (slug && covered.has(slug)) continue;

  if (setName in mappedSets || setName in MANUAL_SETS) continue;

  referenceSets[setName] = codes;

}



const { codes: tisNumericCodes, source: tisSource, tisEntryCount } = await buildTisNumericCodes();



const document = {

  $id: 'cwr_lookup_data_types_v1.0_r0',

  version: '1.0.0',

  revision: 'r1',

  source: tisSource,

  cisacSource: cisacIndex.sourceFile,

  cisacGeneratedAt: cisacIndex.generatedAt,

  generatedAt: new Date().toISOString().slice(0, 10),

  ...(tisEntryCount !== undefined ? { tisEntryCount } : {}),

  sets: {

    ...mappedSets,

    ...MANUAL_SETS,

    identifierSources: buildIdentifierSources(mappedSets),

    writerRoles,

    publisherRoles,

    subPublisherRoles,

    ...referenceSets,

    tisNumericCodes,

  },

};



mkdirSync(dirname(outPath), { recursive: true });

writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
console.log(
  `Wrote ${outPath} (${Object.keys(document.sets).length} sets, ${tisNumericCodes.length} TIS validation strings)`
);

const runtimePath = join(root, 'src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0.json');
const runtimeDocument = { ...document, $id: 'cwr_lookup_data_types_v1.0' };
writeFileSync(runtimePath, `${JSON.stringify(runtimeDocument, null, 2)}\n`, 'utf8');
console.log(`Wrote ${runtimePath}`);


