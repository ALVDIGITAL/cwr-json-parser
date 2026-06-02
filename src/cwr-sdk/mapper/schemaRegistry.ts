import { schemaV1 } from './schemas/schemaV1';
import type { CwrJsonSchema } from './schemaTypes';

/** Single public schema in the Playground; same converter output as Schema A. */
export const jsonSchemaRegistry: CwrJsonSchema<unknown>[] = [schemaV1];

export type SchemaId = typeof jsonSchemaRegistry[number]['id'];
