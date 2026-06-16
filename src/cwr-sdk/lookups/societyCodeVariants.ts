/** CWR society codes are often 3-digit zero-padded; CISAC table uses unpadded numeric strings. */
export function societyCodeVariants(code: string): string[] {
  const trimmed = code.trim();
  const variants = new Set<string>([trimmed]);
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    variants.add(String(n));
    variants.add(String(n).padStart(3, '0'));
  }
  return [...variants];
}
