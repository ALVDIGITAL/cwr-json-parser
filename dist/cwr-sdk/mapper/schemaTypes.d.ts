import type { ParsedCwrFile } from '../types/cwr';
export interface CwrSchemaDefinition {
    $schema: string;
    $id: string;
    title: string;
    [key: string]: unknown;
}
export interface CwrJsonSchema<TOutput> {
    id: string;
    label: string;
    description: string;
    version: string;
    jsonSchema: CwrSchemaDefinition;
    convert(parsed: ParsedCwrFile): TOutput;
}
//# sourceMappingURL=schemaTypes.d.ts.map