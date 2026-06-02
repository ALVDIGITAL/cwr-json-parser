export type ValidationMode = 'strict' | 'advisory';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export interface CwrEdiValidationOptions {
    /** Validate CWR filename convention. Default: true when `filename` is provided. */
    filename?: boolean;
    /** Validate record order inside work block(s). Default: true. */
    recordOrder?: boolean;
    /** Validate transaction/record sequence numbers. Default: true. */
    sequence?: boolean;
    /** `first` = first work block only; `all` = every work block. Default: `all`. */
    scope?: 'first' | 'all';
}
export interface CwrEdiValidationResult {
    valid: boolean;
    filename: ValidationResult | null;
    recordOrder: ValidationResult | null;
    sequence: ValidationResult | null;
}
//# sourceMappingURL=types.d.ts.map