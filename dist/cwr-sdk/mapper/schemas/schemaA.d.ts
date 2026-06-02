import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaAWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    parties?: unknown[];
    recordings?: unknown[];
}
export interface SchemaAOutput {
    header?: Record<string, unknown>;
    works: SchemaAWorkOutput[];
}
export declare const schemaA: CwrJsonSchema<SchemaAOutput>;
//# sourceMappingURL=schemaA.d.ts.map