import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaRelinquishmentWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    parties?: unknown[];
    recordings?: unknown[];
}
export interface SchemaRelinquishmentOutput {
    header?: Record<string, unknown>;
    works: SchemaRelinquishmentWorkOutput[];
}
export declare const schemaRelinquishment: CwrJsonSchema<SchemaRelinquishmentOutput>;
//# sourceMappingURL=schemaRelinquishment.d.ts.map