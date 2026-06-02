import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaGemaWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    recordings?: unknown[];
    societySpecific: {
        cisacCode: string;
        cisacName: string;
        roleSplit: {
            music: number;
            text: number;
        };
    };
    parties?: unknown;
}
export interface SchemaGemaOutput {
    header?: Record<string, unknown>;
    works: SchemaGemaWorkOutput[];
}
export declare const schemaGema: CwrJsonSchema<SchemaGemaOutput>;
//# sourceMappingURL=schemaGema.d.ts.map