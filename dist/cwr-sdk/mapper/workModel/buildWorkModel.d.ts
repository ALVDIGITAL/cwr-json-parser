import { PublisherRegistry } from './publisherRegistry';
import type { WorkModel } from './types';
export declare function buildWorkModel(lines: string[]): WorkModel;
/** Exposed for tests: combined registries from both publisher blocks. */
export declare function createCombinedPublisherRegistry(model: WorkModel): PublisherRegistry;
//# sourceMappingURL=buildWorkModel.d.ts.map