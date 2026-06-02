import { tokenize } from './tokenizer';
import { getRecordType } from './prefix';
import { validateRecordOrder } from '../validators/recordOrderValidator';
import { validateSequenceNumbers } from '../validators/sequenceOrderValidator';

export function detectWorkRecordType(lines: string[]): string {
  const grh = lines.find(l => getRecordType(l) === 'GRH');
  if (!grh) return 'NWR';

  // Transaction type sits at columns 4-6 (0-based 3-6).
  const transactionType = grh.substring(3, 6).trim();
  return transactionType === 'REV' ? 'REV' : 'NWR';
}

export function splitIntoWorkBlocks(rawText: string) {
  const lines = tokenize(rawText);

  const hdr = lines.find(l => getRecordType(l) === 'HDR') || null;
  let lastGrh = null;

  const workRecordType = detectWorkRecordType(lines);
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const type = getRecordType(line);

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
      if (current) blocks.push(current);
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
    if (current) current.push(line);
  }

  // Push last block
  if (current && current.length > 0) {
    blocks.push(current);
  }

  return { hdr, workRecordType, blocks };
}

export function extractFirstWorkPreview(rawText: string) {
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
  const orderValidation = validateRecordOrder(firstBlock);
  const sequenceValidation = validateSequenceNumbers(firstBlock);

  return {
    hdr,
    workRecordType,
    lines: firstBlock,      // IMPORTANT: now an ARRAY
    additional: blocks.length - 1,
    orderValidation,
    sequenceValidation,
  };
}
