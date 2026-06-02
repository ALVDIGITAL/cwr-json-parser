import type { SchemaId } from '../cwr-sdk/mapper/schemaRegistry';
import type { SchemaV1Output } from '../cwr-sdk/types/cwr';
import type { ValidationMode, ValidationResult } from './types';
/**
 * Validate parsed CWR-JSON (Schema v1.0 output) against the bundled JSON Schema.
 */
export declare function validateCwrJson(payload: unknown, mode?: ValidationMode, schemaId?: SchemaId): ValidationResult;
/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
export declare function validateParsedCwr(payload: SchemaV1Output, mode?: ValidationMode): ValidationResult;
//# sourceMappingURL=schemaValidation.d.ts.map