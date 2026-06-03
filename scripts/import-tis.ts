/**
 * Refresh TIS codes from a CISAC TIS database export (.xlsx or .csv).
 *
 * Usage:
 *   npx tsx scripts/import-tis.ts
 *   npx tsx scripts/import-tis.ts "C:/path/to/TIS.xlsx"
 *
 * Default input: src/cwr-sdk/lookups/data/CISAC-TIS.xlsx
 * Then runs schema:generate via npm run lookup:build (call build-lookup-data only here).
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tisArg = process.argv[2];
const scriptDir = resolve(fileURLToPath(import.meta.url), '..');
const buildScript = resolve(scriptDir, 'build-lookup-data.ts');

const result = spawnSync(
  'npx',
  ['tsx', buildScript, ...(tisArg ? [tisArg] : [])],
  { stdio: 'inherit', shell: true, cwd: resolve(scriptDir, '..') }
);

if (result.status !== 0) process.exit(result.status ?? 1);

const gen = spawnSync('npx', ['tsx', resolve(scriptDir, 'generate-schema.ts')], {
  stdio: 'inherit',
  shell: true,
  cwd: resolve(scriptDir, '..'),
});
process.exit(gen.status ?? 0);
