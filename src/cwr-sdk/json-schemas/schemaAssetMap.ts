import type { SchemaId } from '../mapper/schemaRegistry';

import schemaV1Artifact from '../json-schemas/cwr-json-schema-v1.0.schema.json';

/**
 * Unified V1 schema asset (merged canonical + V1 output contract).
 */
export const schemaAssetMap: Record<SchemaId, Record<string, unknown>> = {
  'cwr-json-v1-0': schemaV1Artifact as Record<string, unknown>
};

export function getSchemaAsset(schemaId: SchemaId): Record<string, unknown> {
  const schema = schemaAssetMap[schemaId];
  if (!schema) {
    throw new Error(`Missing generated schema asset for id: ${schemaId}`);
  }
  return schema;
}
