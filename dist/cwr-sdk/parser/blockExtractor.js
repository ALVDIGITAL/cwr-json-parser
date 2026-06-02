"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectWorkRecordType = detectWorkRecordType;
exports.splitIntoWorkBlocks = splitIntoWorkBlocks;
exports.extractFirstWorkPreview = extractFirstWorkPreview;
const tokenizer_1 = require("./tokenizer");
const prefix_1 = require("./prefix");
const recordOrderValidator_1 = require("../validators/recordOrderValidator");
const sequenceOrderValidator_1 = require("../validators/sequenceOrderValidator");
function detectWorkRecordType(lines) {
    const grh = lines.find(l => (0, prefix_1.getRecordType)(l) === 'GRH');
    if (!grh)
        return 'NWR';
    // Transaction type sits at columns 4-6 (0-based 3-6).
    const transactionType = grh.substring(3, 6).trim();
    return transactionType === 'REV' ? 'REV' : 'NWR';
}
function splitIntoWorkBlocks(rawText) {
    const lines = (0, tokenizer_1.tokenize)(rawText);
    const hdr = lines.find(l => (0, prefix_1.getRecordType)(l) === 'HDR') || null;
    let lastGrh = null;
    const workRecordType = detectWorkRecordType(lines);
    const blocks = [];
    let current = null;
    for (const line of lines) {
        const type = (0, prefix_1.getRecordType)(line);
        if (type === 'HDR') {
            // Keep the header separate; we'll prepend it to the first block.
            continue;
        }
        if (type === 'GRH') {
            // Track the last GRH encountered so it can be attached to the block that follows.
            lastGrh = line;
            continue;
        }
        if (type === workRecordType) {
            // Start a new block when we see a work record
            if (current)
                blocks.push(current);
            current = [];
            // For the very first block include HDR (if present) and the GRH that preceded it
            if (blocks.length === 0 && hdr) {
                current.push(hdr);
            }
            if (lastGrh) {
                current.push(lastGrh);
            }
        }
        // If we are inside a block, push the line
        if (current)
            current.push(line);
    }
    // Push last block
    if (current && current.length > 0) {
        blocks.push(current);
    }
    return { hdr, workRecordType, blocks };
}
function extractFirstWorkPreview(rawText) {
    const { hdr, workRecordType, blocks } = splitIntoWorkBlocks(rawText);
    if (!hdr) {
        return {
            workRecordType,
            preview: '(HDR missing)',
            lines: [],
            additional: 0
        };
    }
    if (blocks.length === 0) {
        return {
            workRecordType,
            preview: hdr + '\n(No work blocks found)',
            lines: [],
            additional: 0
        };
    }
    const firstBlock = blocks[0];
    const orderValidation = (0, recordOrderValidator_1.validateRecordOrder)(firstBlock);
    const sequenceValidation = (0, sequenceOrderValidator_1.validateSequenceNumbers)(firstBlock);
    return {
        hdr,
        workRecordType,
        lines: firstBlock, // IMPORTANT: now an ARRAY
        additional: blocks.length - 1,
        orderValidation,
        sequenceValidation,
    };
}
//# sourceMappingURL=blockExtractor.js.map