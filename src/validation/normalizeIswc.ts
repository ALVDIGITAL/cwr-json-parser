const DISPLAY_PATTERN = /^T-\d{9}-\d$/;

/** Format compact / dotted ISWC for JSON Schema (T-NNNNNNNNN-C). Returns null if unrecognized. */
export function formatIswcForValidation(value: string): string | null {
  const raw = value.trim().toUpperCase();
  if (DISPLAY_PATTERN.test(raw)) return raw;

  const compact = raw.replace(/[.\s-]/g, '').replace(/^T/, 'T');
  const withT = compact.startsWith('T') ? compact : `T${compact}`;

  const ninePlusCheck = withT.match(/^T(\d{9})(\d)$/);
  if (ninePlusCheck) {
    return `T-${ninePlusCheck[1]}-${ninePlusCheck[2]}`;
  }

  const tenDigit = withT.match(/^T(\d{10})$/);
  if (tenDigit) {
    const digits = tenDigit[1];
    return `T-${digits.slice(0, 9)}-${digits.slice(9)}`;
  }

  return null;
}

export function isIswcDisplayFormat(value: string): boolean {
  return DISPLAY_PATTERN.test(value.trim().toUpperCase());
}
