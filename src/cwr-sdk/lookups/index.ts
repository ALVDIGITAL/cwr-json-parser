import lookupDocument from './cwr_lookup_data_types_v1.0.json';

export { tisCodeVariants } from './tisCodeVariants';
export { presentSocietyCode, societyCodeVariants } from './societyCodeVariants';

export type LookupDataTypesDocument = typeof lookupDocument;

export type LookupSetName = keyof LookupDataTypesDocument['sets'];

const sets = lookupDocument.sets;

const tisSet = new Set(sets.tisNumericCodes);
const roleSet = new Set(sets.roleCodes);
const publisherRoleSet = new Set(sets.publisherRoles);
const subPublisherRoleSet = new Set(sets.subPublisherRoles);
const writerRoleSet = new Set(sets.writerRoles);
const societySet = new Set(sets.societyCodes);

export function getLookupDataTypes(): LookupDataTypesDocument {
  return lookupDocument;
}

export function getLookupSet<K extends LookupSetName>(name: K): LookupDataTypesDocument['sets'][K] {
  return sets[name];
}

export function hasTisCode(code: string): boolean {
  const trimmed = code.trim();
  if (tisSet.has(trimmed)) return true;
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return (
      tisSet.has(String(n)) ||
      tisSet.has(String(n).padStart(3, '0')) ||
      tisSet.has(String(n).padStart(4, '0'))
    );
  }
  return false;
}

export function isRoleCode(role: string): boolean {
  return roleSet.has(role);
}

export function isPublisherRole(role: string): boolean {
  return publisherRoleSet.has(role);
}

export function isSubPublisherRole(role: string): boolean {
  return subPublisherRoleSet.has(role);
}

export function isWriterRole(role: string): boolean {
  return writerRoleSet.has(role);
}

export function hasSocietyCode(code: string): boolean {
  const trimmed = code.trim();
  if (societySet.has(trimmed)) return true;
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return societySet.has(String(n)) || societySet.has(String(n).padStart(3, '0'));
  }
  return false;
}

export { CISAC_TIS_GROUP_CODES } from './cisacGroups';
