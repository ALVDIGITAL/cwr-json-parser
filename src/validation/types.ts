export type ValidationMode = 'strict' | 'advisory';

export interface ValidationOptions {
  /**
   * Apply layout fixes before validating (ISWC display format, split own/coll territories).
   * Default: true.
   */
  normalize?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  /** Automatic fixes applied before validation (not failures). */
  warnings?: string[];
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
