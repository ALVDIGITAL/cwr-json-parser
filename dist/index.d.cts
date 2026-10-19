import { a as SchemaV1Output, S as SchemaId } from './schemaRegistry-BRkDRYOM.cjs';
export { H as HdrRecord, b as HeaderConventions, P as Participant, R as Recording, c as SchemaV1Messages, d as SchemaV1WorkOutput, W as WorkIdentifier, e as WorkTitle } from './schemaRegistry-BRkDRYOM.cjs';

type ValidationMode = 'strict' | 'advisory';
interface ValidationOptions {
    /**
     * Apply layout fixes before validating (ISWC display format, split own/coll territories).
     * Default: true.
     */
    normalize?: boolean;
}
interface ValidationResult {
    valid: boolean;
    errors: string[];
    /** Automatic fixes applied before validation (not failures). */
    warnings?: string[];
}
interface CwrEdiValidationOptions {
    /** Validate CWR filename convention. Default: true when `filename` is provided. */
    filename?: boolean;
    /** Validate record order inside work block(s). Default: true. */
    recordOrder?: boolean;
    /** Validate transaction/record sequence numbers. Default: true. */
    sequence?: boolean;
    /** `first` = first work block only; `all` = every work block. Default: `all`. */
    scope?: 'first' | 'all';
}
interface CwrEdiValidationResult {
    valid: boolean;
    filename: ValidationResult | null;
    recordOrder: ValidationResult | null;
    sequence: ValidationResult | null;
}

interface NormalizeCwrJsonResult {
    /** Deep-cloned payload with fixes applied for validation. */
    data: SchemaV1Output;
    /** Human-readable notes about automatic fixes (not errors). */
    notes: string[];
}
/**
 * Apply safe, layout-only fixes before JSON Schema validation.
 * Does not mutate the input object.
 */
declare function normalizeCwrJson(payload: unknown): NormalizeCwrJsonResult;

/** Rewrite a recognized ISWC to dotted ISO form T-NNN.NNN.NNN-C. Returns null if unrecognized. */
declare function formatIswcForValidation(value: string): string | null;

/**
 * Validate CWR-JSON (Schema v1.0) with optional pre-normalization and readable errors.
 */
declare function validateCwrJson(payload: unknown, mode?: ValidationMode, schemaId?: SchemaId, options?: ValidationOptions): ValidationResult;
/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
declare function validateParsedCwr(payload: SchemaV1Output, mode?: ValidationMode, options?: ValidationOptions): ValidationResult;

/**
 * Validate a CWR filename against the CWyynnnnsss_rrr.Vxx convention.
 * Generic `.cwr` names are accepted for local testing.
 */
declare function validateCwrFilename(filename: string): ValidationResult;
/**
 * Validate CWR record order inside work block(s) (CWR 2.1/2.2 sequence rules).
 */
declare function validateCwrRecordOrder(cwrContent: string, scope?: 'first' | 'all'): ValidationResult;
/**
 * Validate TransactionSeq / RecordSeq numbering inside work block(s).
 */
declare function validateCwrSequence(cwrContent: string, scope?: 'first' | 'all'): ValidationResult;
/**
 * Run EDI-level validations (filename + record order + sequence) on raw CWR text.
 */
declare function validateCwrEdi(cwrContent: string, filename?: string, options?: CwrEdiValidationOptions): CwrEdiValidationResult;

/**
 * Parse CWR file contents into CWR-JSON Schema v1.0 output.
 *
 * @param cwrContent - Full CWR file text (UTF-8). In the browser use `await file.text()`;
 *   in Node use `fs.readFileSync(path, 'utf8')` or `buffer.toString('utf8')`.
 */
declare function parseCwr(cwrContent: string): SchemaV1Output;

export { type CwrEdiValidationOptions, type CwrEdiValidationResult, type NormalizeCwrJsonResult, SchemaV1Output, type ValidationMode, type ValidationOptions, type ValidationResult, formatIswcForValidation, normalizeCwrJson, parseCwr, validateCwrEdi, validateCwrFilename, validateCwrJson, validateCwrRecordOrder, validateCwrSequence, validateParsedCwr };
