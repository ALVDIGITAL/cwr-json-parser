import type { CwrJsonSchema } from '../schemaTypes';
export interface SchemaAckMessage {
    type: string;
    value: string;
}
export interface SchemaAckIdentifier {
    source: string;
    value: string;
}
export interface SchemaAckWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers: SchemaAckIdentifier[];
    parties?: unknown;
    recordings?: unknown[];
}
export interface SchemaAckOutput {
    header?: Record<string, unknown>;
    works: SchemaAckWorkOutput[];
}
export declare const schemaAck: CwrJsonSchema<SchemaAckOutput>;
//# sourceMappingURL=schemaAck.d.ts.map