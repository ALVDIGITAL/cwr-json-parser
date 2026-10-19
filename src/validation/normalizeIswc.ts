const DOTTED_PATTERN = /^T-\d{3}\.\d{3}\.\d{3}-\d$/;

/** Rewrite a recognized ISWC to dotted ISO form T-NNN.NNN.NNN-C. Returns null if unrecognized. */
export function formatIswcForValidation(value: string): string | null {
  const compact = value.trim().toUpperCase().replace(/[.\s-]/g, '');
  const match = compact.match(/^T(\d{9})(\d)$/);
  if (!match) return null;
  const digits = match[1];
  return `T-${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${match[2]}`;
}

export function isIswcDisplayFormat(value: string): boolean {
  return DOTTED_PATTERN.test(value.trim().toUpperCase());
}
