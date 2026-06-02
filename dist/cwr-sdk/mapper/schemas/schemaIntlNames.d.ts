import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaIntlNamesWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    parties: unknown[];
}
export interface SchemaIntlNamesOutput {
    header?: Record<string, unknown>;
    works: SchemaIntlNamesWorkOutput[];
}
export declare const schemaIntlNames: CwrJsonSchema<SchemaIntlNamesOutput>;
//# sourceMappingURL=schemaIntlNames.d.ts.map