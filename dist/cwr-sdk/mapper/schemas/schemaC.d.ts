import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaCWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    parties: {
        interestedParties?: unknown[];
    };
    recordings?: unknown[];
}
export interface SchemaCOutput {
    header?: Record<string, unknown>;
    works: SchemaCWorkOutput[];
}
export declare const schemaC: CwrJsonSchema<SchemaCOutput>;
//# sourceMappingURL=schemaC.d.ts.map