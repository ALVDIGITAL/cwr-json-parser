/** All string forms seen in CWR-JSON / EDI (trimmed field, 3- and 4-digit padding). */
export function tisCodeVariants(raw: string | number): string[] {
  const trimmed = String(raw).trim();
  if (!/^\d+$/.test(trimmed)) return [trimmed];
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n)) return [trimmed];
  const variants = new Set<string>();
  variants.add(String(n));
  variants.add(String(n).padStart(3, '0'));
  variants.add(String(n).padStart(4, '0'));
  if (trimmed !== String(n)) variants.add(trimmed);
  return [...variants];
}
