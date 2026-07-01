import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function cwrLine(recordType, fields, minLength = 320) {
  const chars = Array.from({ length: minLength }, () => ' ');
  for (let i = 0; i < Math.min(3, recordType.length); i++) chars[i] = recordType[i];
  for (const [start, value] of Object.entries(fields)) {
    const offset = Number(start) - 1;
    for (let i = 0; i < value.length && offset + i < minLength; i++) {
      chars[offset + i] = value[i];
    }
  }
  return chars.join('');
}

function xrfLine(transactionSeq, recordSeq, organisationCode, identifier, identifierType, validity) {
  return cwrLine(
    'XRF',
    {
      4: transactionSeq.padStart(8, '0'),
      12: recordSeq.padStart(8, '0'),
      20: organisationCode.padEnd(3, ' ').slice(0, 3),
      23: identifier.padEnd(14, ' ').slice(0, 14),
      37: identifierType,
      38: validity,
    },
    40
  );
}

const hdr = cwrLine(
  'HDR',
  {
    4: '00000000001',
    15: 'XRF SAMPLE PUBLISHER'.padEnd(45, ' '),
    60: '02.20',
    65: '20260630',
    73: '120000',
    79: '20260630',
  },
  168
);

const grh = cwrLine('GRH', { 4: 'NWR', 7: '00001', 12: '02.20' }, 32);

const nwr = cwrLine(
  'NWR',
  {
    4: '00000001',
    12: '00000000',
    20: 'XRF IDENTIFIER DEMO WORK'.padEnd(60, ' '),
    82: 'SW00000000001',
    96: 'T0000000010',
    127: 'POP',
    136: 'U',
    143: 'ORI',
  },
  320
);

const lines = [
  hdr,
  grh,
  nwr,
  xrfLine('00000001', '00000001', '035', '3987389001', 'W', 'Y'),
  xrfLine('00000001', '00000002', 'ISW', 'T0000000010', 'W', 'Y'),
  xrfLine('00000001', '00000003', 'ISR', 'USRC17607839', 'R', 'Y'),
  xrfLine('00000001', '00000004', 'EMI', 'EMI-00042', 'W', 'Y'),
  xrfLine('00000001', '00000005', '035', 'SKIPPED-BAD', 'W', 'N'),
  xrfLine('00000001', '00000006', '000', 'SHOULD-SKIP', 'W', 'Y'),
];

const outPath = join(root, 'test', 'files', 'XRF-identifiers-sample.V22');
writeFileSync(outPath, `${lines.join('\r\n')}\r\n`, 'utf8');
console.log(`Wrote ${outPath}`);
