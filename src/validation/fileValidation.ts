import { splitIntoWorkBlocks } from '../cwr-sdk/parser/blockExtractor';
import { validateCwrFilename as validateFilenameInternal } from '../cwr-sdk/validators/filenameValidator';
import { validateRecordOrder } from '../cwr-sdk/validators/recordOrderValidator';
import { validateSequenceNumbers } from '../cwr-sdk/validators/sequenceOrderValidator';
import type {
  CwrEdiValidationOptions,
  CwrEdiValidationResult,
  ValidationResult,
} from './types';

function toValidationResult(ok: boolean, problems: string[]): ValidationResult {
  return { valid: ok, errors: problems };
}

/**
 * Validate a CWR filename against the CWyynnnnsss_rrr.Vxx convention.
 * Generic `.cwr` names are accepted for local testing.
 */
export function validateCwrFilename(filename: string): ValidationResult {
  const message = validateFilenameInternal(filename);
  return message ? { valid: false, errors: [message] } : { valid: true, errors: [] };
}

function getWorkBlocks(cwrContent: string, scope: 'first' | 'all'): string[][] {
  const { blocks } = splitIntoWorkBlocks(cwrContent);
  if (blocks.length === 0) return [];
  return scope === 'first' ? [blocks[0]] : blocks;
}

/**
 * Validate CWR record order inside work block(s) (CWR 2.1/2.2 sequence rules).
 */
export function validateCwrRecordOrder(
  cwrContent: string,
  scope: 'first' | 'all' = 'all'
): ValidationResult {
  const blocks = getWorkBlocks(cwrContent, scope);
  if (blocks.length === 0) {
    return { valid: false, errors: ['No work blocks found in CWR content.'] };
  }

  const errors: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const { ok, problems } = validateRecordOrder(blocks[i]);
    if (!ok) {
      const prefix = blocks.length > 1 ? `Work block ${i + 1}: ` : '';
      errors.push(...problems.map((p) => `${prefix}${p}`));
    }
  }

  return toValidationResult(errors.length === 0, errors);
}

/**
 * Validate TransactionSeq / RecordSeq numbering inside work block(s).
 */
export function validateCwrSequence(
  cwrContent: string,
  scope: 'first' | 'all' = 'all'
): ValidationResult {
  const blocks = getWorkBlocks(cwrContent, scope);
  if (blocks.length === 0) {
    return { valid: false, errors: ['No work blocks found in CWR content.'] };
  }

  const errors: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const { ok, problems } = validateSequenceNumbers(blocks[i]);
    if (!ok) {
      const prefix = blocks.length > 1 ? `Work block ${i + 1}: ` : '';
      errors.push(...problems.map((p) => `${prefix}${p}`));
    }
  }

  return toValidationResult(errors.length === 0, errors);
}

/**
 * Run EDI-level validations (filename + record order + sequence) on raw CWR text.
 */
export function validateCwrEdi(
  cwrContent: string,
  filename?: string,
  options: CwrEdiValidationOptions = {}
): CwrEdiValidationResult {
  const {
    filename: checkFilename = Boolean(filename),
    recordOrder: checkOrder = true,
    sequence: checkSequence = true,
    scope = 'all',
  } = options;

  const filenameResult =
    checkFilename && filename !== undefined ? validateCwrFilename(filename) : null;
  const recordOrderResult = checkOrder ? validateCwrRecordOrder(cwrContent, scope) : null;
  const sequenceResult = checkSequence ? validateCwrSequence(cwrContent, scope) : null;

  const valid =
    (filenameResult?.valid ?? true) &&
    (recordOrderResult?.valid ?? true) &&
    (sequenceResult?.valid ?? true);

  return {
    valid,
    filename: filenameResult,
    recordOrder: recordOrderResult,
    sequence: sequenceResult,
  };
}
