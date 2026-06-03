import { S as SchemaId } from './schemaRegistry-BinhPabU.js';

/**
 * Unified V1 schema asset (merged canonical + V1 output contract).
 */
declare const schemaAssetMap: Record<SchemaId, Record<string, unknown>>;
declare function getSchemaAsset(schemaId: SchemaId): Record<string, unknown>;

export { SchemaId, getSchemaAsset, schemaAssetMap };
