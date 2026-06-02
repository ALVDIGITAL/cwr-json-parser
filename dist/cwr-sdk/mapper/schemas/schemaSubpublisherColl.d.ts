import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaSubpublisherCollWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    parties?: unknown[];
    recordings?: unknown[];
}
export interface SchemaSubpublisherCollOutput {
    header?: Record<string, unknown>;
    works: SchemaSubpublisherCollWorkOutput[];
}
export declare const schemaSubpublisherColl: CwrJsonSchema<SchemaSubpublisherCollOutput>;
//# sourceMappingURL=schemaSubpublisherColl.d.ts.map