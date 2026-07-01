/** Build a fixed-width CWR line (1-based column positions). */
export function cwrLine(recordType: string, fields: Record<number, string>, minLength = 320): string {
  const chars = Array.from({ length: minLength }, () => ' ');
  for (let i = 0; i < Math.min(3, recordType.length); i++) {
    chars[i] = recordType[i];
  }
  for (const [start, value] of Object.entries(fields)) {
    const offset = Number(start) - 1;
    for (let i = 0; i < value.length && offset + i < minLength; i++) {
      chars[offset + i] = value[i];
    }
  }
  return chars.join('');
}

/** XRF detail record (Work ID Cross Reference). */
export function xrfLine(
  transactionSeq: string,
  recordSeq: string,
  organisationCode: string,
  identifier: string,
  identifierType: string,
  validity: string
): string {
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

/** Minimal valid single-work CWR (HDR + GRH + NWR). */
export function minimalOneWorkCwr(): string {
  const hdr = cwrLine('HDR', {
    4: '00000000001',
    15: 'TEST PUBLISHER'.padEnd(45, ' '),
    60: '01.10',
    65: '20250529',
    73: '120030',
    79: '20250529',
  }, 168);

  const grh = cwrLine('GRH', {
    4: 'NWR',
    7: '00001',
    12: '02.10',
  }, 32);

  const nwr = cwrLine('NWR', {
    4: '00000001',
    12: '00000000',
    20: 'TEST WORK'.padEnd(60, ' '),
    82: 'SW00000000001',
    127: 'POP',
    136: 'U',
    143: 'ORI',
  }, 320);

  return [hdr, grh, nwr].join('\n');
}

/** Same as minimal but NWR record seq is wrong (should be 00000000). */
export function minimalOneWorkBadSequenceCwr(): string {
  const hdr = cwrLine('HDR', {
    4: '00000000001',
    15: 'TEST PUBLISHER'.padEnd(45, ' '),
    60: '01.10',
    65: '20250529',
    73: '120030',
    79: '20250529',
  }, 168);

  const grh = cwrLine('GRH', { 4: 'NWR', 7: '00001', 12: '02.10' }, 32);

  const nwr = cwrLine('NWR', {
    4: '00000001',
    12: '00000001',
    20: 'TEST WORK'.padEnd(60, ' '),
    82: 'SW00000000001',
    127: 'POP',
    136: 'U',
    143: 'ORI',
  }, 320);

  return [hdr, grh, nwr].join('\n');
}
