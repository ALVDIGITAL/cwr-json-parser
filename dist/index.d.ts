import { S as SchemaId, a as SchemaV1Output } from './schemaRegistry-BinhPabU.js';
export { H as HdrRecord, P as Participant, R as Recording, b as SchemaV1Messages, c as SchemaV1WorkOutput, W as WorkIdentifier, d as WorkTitle } from './schemaRegistry-BinhPabU.js';

type ValidationMode = 'strict' | 'advisory';
interface ValidationResult {
    valid: boolean;
    errors: string[];
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

/**
 * Validate parsed CWR-JSON (Schema v1.0 output) against the bundled JSON Schema.
 */
declare function validateCwrJson(payload: unknown, mode?: ValidationMode, schemaId?: SchemaId): ValidationResult;
/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
declare function validateParsedCwr(payload: SchemaV1Output, mode?: ValidationMode): ValidationResult;

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

export { type CwrEdiValidationOptions, type CwrEdiValidationResult, SchemaV1Output, type ValidationMode, type ValidationResult, parseCwr, validateCwrEdi, validateCwrFilename, validateCwrJson, validateCwrRecordOrder, validateCwrSequence, validateParsedCwr };
