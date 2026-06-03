import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { tisCodeVariants } from '../src/cwr-sdk/lookups/tisCodeVariants.ts';

export type TisExportRow = {
  tisN: string;
  type: string;
  tisA: string;
  name: string;
};

const DEFAULT_SHEET = 'en';

/** Parse CISAC TIS database export (ISTIS-0184-style columns). */
export function parseTisXlsx(
  filePath: string,
  sheetName: string = DEFAULT_SHEET
): { rows: TisExportRow[]; numericCodes: string[] } {
  if (!existsSync(filePath)) {
    throw new Error(`TIS export not found: ${filePath}`);
  }
  const buf = readFileSync(filePath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[sheetName] ?? wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const rows: TisExportRow[] = [];
  const codeSet = new Set<string>();

  for (const row of raw) {
    const tisN = row['TIS-N'] ?? row['TIS-N '] ?? row.TISN;
    if (tisN === '' || tisN === undefined || tisN === 'TIS-N') continue;
    const tisNStr = String(tisN).trim();
    rows.push({
      tisN: tisNStr,
      type: String(row.Type ?? row.TYPE ?? '').trim(),
      tisA: String(row['TIS-A'] ?? '').trim(),
      name: String(row.Name ?? row.NAME ?? '').trim(),
    });
    for (const v of tisCodeVariants(tisNStr)) codeSet.add(v);
  }

  const numericCodes = [...codeSet].sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b)
  );

  return { rows, numericCodes };
}

export function resolveTisExportPath(cliPath?: string): string {
  if (cliPath) return resolve(cliPath);
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  return resolve(root, 'src/cwr-sdk/lookups/data/CISAC-TIS.xlsx');
}
