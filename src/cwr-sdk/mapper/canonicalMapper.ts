import { ParsedCwrFile } from '../types/cwr';
import { toCanonicalFromLines } from './workModel/projectCanonical';

export { buildWorkModel } from './workModel/buildWorkModel';
export { projectCanonicalFromModel, toCanonicalFromLines } from './workModel/projectCanonical';
export type { WorkModel, WriterGroup, PublisherChain, PartyNode } from './workModel/types';

export function toCanonical(previewData: { lines?: string[] }): ParsedCwrFile {
  const { lines = [] } = previewData || {};
  return toCanonicalFromLines(lines);
}
