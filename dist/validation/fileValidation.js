"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCwrFilename = validateCwrFilename;
exports.validateCwrRecordOrder = validateCwrRecordOrder;
exports.validateCwrSequence = validateCwrSequence;
exports.validateCwrEdi = validateCwrEdi;
const blockExtractor_1 = require("../cwr-sdk/parser/blockExtractor");
const filenameValidator_1 = require("../cwr-sdk/validators/filenameValidator");
const recordOrderValidator_1 = require("../cwr-sdk/validators/recordOrderValidator");
const sequenceOrderValidator_1 = require("../cwr-sdk/validators/sequenceOrderValidator");
function toValidationResult(ok, problems) {
    return { valid: ok, errors: problems };
}
/**
 * Validate a CWR filename against the CWyynnnnsss_rrr.Vxx convention.
 * Generic `.cwr` names are accepted for local testing.
 */
function validateCwrFilename(filename) {
    const message = (0, filenameValidator_1.validateCwrFilename)(filename);
    return message ? { valid: false, errors: [message] } : { valid: true, errors: [] };
}
function getWorkBlocks(cwrContent, scope) {
    const { blocks } = (0, blockExtractor_1.splitIntoWorkBlocks)(cwrContent);
    if (blocks.length === 0)
        return [];
    return scope === 'first' ? [blocks[0]] : blocks;
}
/**
 * Validate CWR record order inside work block(s) (CWR 2.1/2.2 sequence rules).
 */
function validateCwrRecordOrder(cwrContent, scope = 'all') {
    const blocks = getWorkBlocks(cwrContent, scope);
    if (blocks.length === 0) {
        return { valid: false, errors: ['No work blocks found in CWR content.'] };
    }
    const errors = [];
    for (let i = 0; i < blocks.length; i++) {
        const { ok, problems } = (0, recordOrderValidator_1.validateRecordOrder)(blocks[i]);
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
function validateCwrSequence(cwrContent, scope = 'all') {
    const blocks = getWorkBlocks(cwrContent, scope);
    if (blocks.length === 0) {
        return { valid: false, errors: ['No work blocks found in CWR content.'] };
    }
    const errors = [];
    for (let i = 0; i < blocks.length; i++) {
        const { ok, problems } = (0, sequenceOrderValidator_1.validateSequenceNumbers)(blocks[i]);
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
function validateCwrEdi(cwrContent, filename, options = {}) {
    const { filename: checkFilename = Boolean(filename), recordOrder: checkOrder = true, sequence: checkSequence = true, scope = 'all', } = options;
    const filenameResult = checkFilename && filename !== undefined ? validateCwrFilename(filename) : null;
    const recordOrderResult = checkOrder ? validateCwrRecordOrder(cwrContent, scope) : null;
    const sequenceResult = checkSequence ? validateCwrSequence(cwrContent, scope) : null;
    const valid = (filenameResult?.valid ?? true) &&
        (recordOrderResult?.valid ?? true) &&
        (sequenceResult?.valid ?? true);
    return {
        valid,
        filename: filenameResult,
        recordOrder: recordOrderResult,
        sequence: sequenceResult,
    };
}
//# sourceMappingURL=fileValidation.js.map