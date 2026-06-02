import { ParsedCwrFile } from '../types/cwr';
export { buildWorkModel } from './workModel/buildWorkModel';
export { projectCanonicalFromModel, toCanonicalFromLines } from './workModel/projectCanonical';
export type { WorkModel, WriterGroup, PublisherChain, PartyNode } from './workModel/types';
export declare function toCanonical(previewData: {
    lines?: string[];
}): ParsedCwrFile;
//# sourceMappingURL=canonicalMapper.d.ts.map