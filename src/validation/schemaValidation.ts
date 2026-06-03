import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { getSchemaAsset } from '../cwr-sdk/json-schemas/schemaAssetMap';
import type { SchemaId } from '../cwr-sdk/mapper/schemaRegistry';
import type { SchemaV1Output } from '../cwr-sdk/types/cwr';
import {
  ajvErrorToIssue,
  dedupeIssues,
  formatSemanticError,
  issuesToStrings,
  type ValidationIssue,
} from './formatValidationErrors';
import { normalizeCwrJson } from './normalizeCwrJson';
import { validateCwrJsonSemantic } from './semanticValidation';
import type { ValidationMode, ValidationOptions, ValidationResult } from './types';

const DEFAULT_SCHEMA_ID: SchemaId = 'cwr-json-v1-0';

const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

const validatorCache = new Map<SchemaId, ValidateFunction>();

function getValidator(schemaId: SchemaId = DEFAULT_SCHEMA_ID): ValidateFunction {
  const cached = validatorCache.get(schemaId);
  if (cached) return cached;
  const validator = ajv.compile(getSchemaAsset(schemaId));
  validatorCache.set(schemaId, validator);
  return validator;
}

function prefixNotes(notes: string[]): string[] {
  if (!notes.length) return [];
  const header = notes.length === 1 ? 'Auto-fixed before validation:' : `Auto-fixed ${notes.length} item(s) before validation:`;
  const body = notes.length <= 5 ? notes : [...notes.slice(0, 5), `…and ${notes.length - 5} more`];
  return [header, ...body.map((n) => `  • ${n}`)];
}

/**
 * Validate CWR-JSON (Schema v1.0) with optional pre-normalization and readable errors.
 */
export function validateCwrJson(
  payload: unknown,
  mode: ValidationMode = 'strict',
  schemaId: SchemaId = DEFAULT_SCHEMA_ID,
  options: ValidationOptions = {}
): ValidationResult {
  const normalize = options.normalize !== false;

  try {
    const { data, notes } = normalize ? normalizeCwrJson(payload) : { data: payload, notes: [] as string[] };
    const validator = getValidator(schemaId);
    const schemaValid = Boolean(validator(data));
    const ajvIssues = dedupeIssues((validator.errors || []).map(ajvErrorToIssue));
    const semanticIssues = dedupeIssues(
      validateCwrJsonSemantic(data).map((line) => formatSemanticError(line)).filter((x): x is ValidationIssue => x !== null)
    );
    const allIssues = dedupeIssues([...ajvIssues, ...semanticIssues]);
    const errors = issuesToStrings(allIssues);
    const warnings = prefixNotes(notes);
    const valid = schemaValid && semanticIssues.length === 0;

    if (mode === 'advisory') {
      return { valid: true, errors, warnings: warnings.length ? warnings : undefined };
    }

    return {
      valid,
      errors,
      warnings: warnings.length ? warnings : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [`1. / [SETUP]: validation failed to run (${message})`],
    };
  }
}

/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
export function validateParsedCwr(
  payload: SchemaV1Output,
  mode: ValidationMode = 'strict',
  options?: ValidationOptions
): ValidationResult {
  return validateCwrJson(payload, mode, DEFAULT_SCHEMA_ID, options);
}

export { normalizeCwrJson } from './normalizeCwrJson';
export type { NormalizeCwrJsonResult } from './normalizeCwrJson';
export { formatIswcForValidation } from './normalizeIswc';
