import type { CwrEdiValidationOptions, CwrEdiValidationResult, ValidationResult } from './types';
/**
 * Validate a CWR filename against the CWyynnnnsss_rrr.Vxx convention.
 * Generic `.cwr` names are accepted for local testing.
 */
export declare function validateCwrFilename(filename: string): ValidationResult;
/**
 * Validate CWR record order inside work block(s) (CWR 2.1/2.2 sequence rules).
 */
export declare function validateCwrRecordOrder(cwrContent: string, scope?: 'first' | 'all'): ValidationResult;
/**
 * Validate TransactionSeq / RecordSeq numbering inside work block(s).
 */
export declare function validateCwrSequence(cwrContent: string, scope?: 'first' | 'all'): ValidationResult;
/**
 * Run EDI-level validations (filename + record order + sequence) on raw CWR text.
 */
export declare function validateCwrEdi(cwrContent: string, filename?: string, options?: CwrEdiValidationOptions): CwrEdiValidationResult;
//# sourceMappingURL=fileValidation.d.ts.map