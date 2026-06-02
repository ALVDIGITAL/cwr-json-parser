import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaSubpublisherIntlWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    recordings?: unknown[];
    intl?: {
        interestedParties: unknown[];
    };
}
export interface SchemaSubpublisherIntlOutput {
    header?: Record<string, unknown>;
    works: SchemaSubpublisherIntlWorkOutput[];
}
export declare const schemaSubpublisherIntl: CwrJsonSchema<SchemaSubpublisherIntlOutput>;
//# sourceMappingURL=schemaSubpublisherIntl.d.ts.map