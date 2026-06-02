

// Validates that sequence numbers are consistent inside a work block:
// - TransactionSeq is constant across all applicable records in the block
// - Work-start record (NWR/REV/ISW/EXC) must have RecordSeq = 00000000
// - Then RecordSeq increments by 1 for each subsequent applicable record

import { getRecordType } from "../parser/prefix";

function parseSeqFields(line: string) {
  // Most CWR records have:
  // cols 1-3: RecordType
  // cols 4-11: TransactionSeq (8 chars)
  // cols 12-19: RecordSeq (8 chars)
  // (1-based columns; 0-based indices below)
  if (!line || line.length < 19) return null;
  const txRaw = line.substring(3, 11);
  const recRaw = line.substring(11, 19);
  if (!/^\d{8}$/.test(txRaw) || !/^\d{8}$/.test(recRaw)) return null;
  return {
    transactionSeqRaw: txRaw,
    recordSeqRaw: recRaw,
    transactionSeq: parseInt(txRaw, 10),
    recordSeq: parseInt(recRaw, 10),
  };
}

// This catches copy/paste reordering where the ordering might be fixed but numbering isn't (or vice versa).
export function validateSequenceNumbers(lines: string[]): { ok: boolean; problems: string[] } {
  const ignore = new Set(['HDR', 'GRH', 'GRT', 'TRL']);
  const problems = [];

  let expectedRecordSeq = 0;
  let transactionSeqSeen = null;
  let sawAnyNumberedRecord = false;
  let sawWorkStart = false;

  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;

    const seq = parseSeqFields(lines[i]);
    if (!seq) {
      // Some records may not have the standard seq fields; ignore them.
      continue;
    }

    sawAnyNumberedRecord = true;

    if (transactionSeqSeen === null) {
      transactionSeqSeen = seq.transactionSeqRaw;
    } else if (transactionSeqSeen !== seq.transactionSeqRaw) {
      problems.push(
        `TransactionSeq mismatch at line ${i + 1} (${type}): expected ${transactionSeqSeen} but got ${seq.transactionSeqRaw}.`
      );
    }

    const actual = seq.recordSeq;

    if (!sawWorkStart && ['NWR', 'REV', 'ISW', 'EXC'].includes(type)) {
      sawWorkStart = true;
      if (actual !== 0) {
        problems.push(
          `Work-start record ${type} at line ${i + 1} must have RecordSeq 00000000, but got ${seq.recordSeqRaw}.`
        );
      }
      expectedRecordSeq = 0;
    }

    if (actual !== expectedRecordSeq) {
      problems.push(
        `RecordSeq mismatch at line ${i + 1} (${type}): expected ${String(expectedRecordSeq).padStart(8, '0')} but got ${seq.recordSeqRaw}.`
      );
      // Re-sync to continue reporting useful errors instead of cascading.
      expectedRecordSeq = actual + 1;
    } else {
      expectedRecordSeq++;
    }
  }

  // If we saw numbered records and the first one wasn't 1, the first mismatch message covers it.
  // Still, if we never saw any numbered records, return ok (nothing to validate).
  if (!sawAnyNumberedRecord) {
    return { ok: true, problems: [] };
  }

  return {
    ok: problems.length === 0,
    problems,
  };
}
