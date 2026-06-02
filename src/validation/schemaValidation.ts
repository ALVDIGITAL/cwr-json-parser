import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { getSchemaAsset } from '../cwr-sdk/json-schemas/schemaAssetMap';
import type { SchemaId } from '../cwr-sdk/mapper/schemaRegistry';
import type { SchemaV1Output } from '../cwr-sdk/types/cwr';
import type { ValidationMode, ValidationResult } from './types';

const DEFAULT_SCHEMA_ID: SchemaId = 'cwr-json-v1-0';

const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

const validatorCache = new Map<SchemaId, ValidateFunction>();

function normalizeErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors?.length) return [];
  return errors.map((err, index) => formatAjvError(err, index + 1));
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[array(${value.length})]`;
  if (typeof value === 'object') return '[object]';
  return String(value);
}

function formatPath(path: string): string {
  return path.length ? path : '/';
}

function escapeJsonPointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

function appendPathSegment(basePath: string, segment: string): string {
  const normalized = formatPath(basePath);
  const escaped = escapeJsonPointerSegment(segment);
  return normalized === '/' ? `/${escaped}` : `${normalized}/${escaped}`;
}

function getExpectedHint(err: ErrorObject): string | null {
  if (err.keyword === 'type' && typeof err.params === 'object' && err.params && 'type' in err.params) {
    return `expected type ${(err.params as { type: string }).type}`;
  }
  if (err.keyword === 'required' && typeof err.params === 'object' && err.params && 'missingProperty' in err.params) {
    return `expected required property ${(err.params as { missingProperty: string }).missingProperty}`;
  }
  if (
    err.keyword === 'additionalProperties' &&
    typeof err.params === 'object' &&
    err.params &&
    'additionalProperty' in err.params
  ) {
    return `unexpected property ${(err.params as { additionalProperty: string }).additionalProperty}`;
  }
  return null;
}

function formatAjvError(err: ErrorObject, order: number): string {
  let path = formatPath(err.instancePath);
  if (err.keyword === 'required' && typeof err.params === 'object' && err.params && 'missingProperty' in err.params) {
    path = appendPathSegment(path, String((err.params as { missingProperty: string }).missingProperty));
  }
  const expectedHint = getExpectedHint(err);
  const keyword = err.keyword ? ` [${err.keyword}]` : '';
  const message = err.message || 'invalid value';
  if (expectedHint) {
    return `${order}. ${path}${keyword}: ${message}; ${expectedHint}`;
  }
  return `${order}. ${path}${keyword}: ${message}`;
}

function getValidator(schemaId: SchemaId = DEFAULT_SCHEMA_ID): ValidateFunction {
  const cached = validatorCache.get(schemaId);
  if (cached) return cached;
  const validator = ajv.compile(getSchemaAsset(schemaId));
  validatorCache.set(schemaId, validator);
  return validator;
}

/**
 * Validate parsed CWR-JSON (Schema v1.0 output) against the bundled JSON Schema.
 */
export function validateCwrJson(
  payload: unknown,
  mode: ValidationMode = 'strict',
  schemaId: SchemaId = DEFAULT_SCHEMA_ID
): ValidationResult {
  try {
    const validator = getValidator(schemaId);
    const valid = Boolean(validator(payload));
    const errors = normalizeErrors(validator.errors);

    if (mode === 'advisory') {
      return { valid: true, errors };
    }

    return { valid, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [`/: validation setup error - ${message}`],
    };
  }
}

/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
export function validateParsedCwr(
  payload: SchemaV1Output,
  mode: ValidationMode = 'strict'
): ValidationResult {
  return validateCwrJson(payload, mode);
}
