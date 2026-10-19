"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/entries/edi-preview.ts
var edi_preview_exports = {};
__export(edi_preview_exports, {
  detectWorkRecordType: () => detectWorkRecordType,
  extractFirstWorkPreview: () => extractFirstWorkPreview,
  splitIntoWorkBlocks: () => splitIntoWorkBlocks
});
module.exports = __toCommonJS(edi_preview_exports);

// src/cwr-sdk/parser/tokenizer.ts
function tokenize(raw) {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim().length > 0);
}
__name(tokenize, "tokenize");

// src/cwr-sdk/parser/prefix.ts
function getRecordType(line) {
  return line.substring(0, 3);
}
__name(getRecordType, "getRecordType");

// src/cwr-sdk/validators/recordOrderValidator.ts
function validateRecordOrder(lines) {
  const ignore = /* @__PURE__ */ new Set(["HDR", "GRH", "GRT", "TRL", "MSG"]);
  const slots = [
    { type: ["NWR", "REV", "ISW", "EXC"], block: 0 },
    { type: ["SPU"], block: 1 },
    // Publisher Block Starts
    { type: ["NPN"], block: 1 },
    { type: ["SPT"], block: 1 },
    { type: ["OPT"], block: 1 },
    { type: ["OPU"], block: 2 },
    // Other Publisher Block
    { type: ["NPN"], block: 2 },
    { type: ["OPT"], block: 2 },
    { type: ["SWR"], block: 3 },
    // Writer Block Starts
    { type: ["NWN"], block: 3 },
    { type: ["SWT"], block: 3 },
    { type: ["PWR"], block: 3 },
    { type: ["OWR"], block: 4 },
    // Other Writer Block
    { type: ["NWN"], block: 4 },
    { type: ["OWT"], block: 4 },
    { type: ["PWR"], block: 4 },
    { type: ["ALT"], block: 5 },
    // Titles Block Starts
    { type: ["NAT"], block: 5 },
    { type: ["EWT"], block: 5 },
    { type: ["NET"], block: 5 },
    { type: ["NOW"], block: 5 },
    { type: ["PER"], block: 6 },
    // Performance Data Block
    { type: ["NPR"], block: 6 },
    { type: ["REC"], block: 7 },
    // Recording Block
    { type: ["ORN"], block: 7 },
    { type: ["INS"], block: 7 },
    { type: ["IND"], block: 7 },
    { type: ["COM"], block: 7 },
    { type: ["NCT"], block: 7 },
    { type: ["NOW"], block: 7 },
    { type: ["ARI"], block: 8 },
    { type: ["XRF"], block: 8 }
  ];
  const loopStarters = /* @__PURE__ */ new Set(["SPU", "OPU", "SWR", "OWR", "ALT", "NAT", "PER", "REC"]);
  const problems = [];
  let currentSlotIdx = 0;
  let sawWorkStart = false;
  let ackHeader = false;
  const assignedSlots = new Array(lines.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;
    if (type === "ACK") {
      if (sawWorkStart) {
        problems.push(`Unexpected ACK at line ${i + 1}`);
      }
      sawWorkStart = true;
      ackHeader = true;
      currentSlotIdx = 0;
      continue;
    }
    if (["NWR", "REV", "ISW", "EXC"].includes(type)) {
      if (sawWorkStart && !ackHeader) {
        problems.push(`Unexpected ${type} at line ${i + 1}; work blocks must start with a single NWR/REV/ISW/EXC.`);
      }
      sawWorkStart = true;
      ackHeader = false;
      currentSlotIdx = 0;
    }
    const potentialMatches = slots.map((s, idx) => s.type.includes(type) ? idx : -1).filter((idx) => idx !== -1);
    if (potentialMatches.length === 0) {
      problems.push(`Record "${type}" at line ${i + 1} is not recognized in CWR 2.1/2.2.`);
      continue;
    }
    let matchIdx = potentialMatches.find((idx) => idx >= currentSlotIdx);
    if (matchIdx === void 0) {
      const rewindIdx = potentialMatches.find((idx) => idx < currentSlotIdx);
      if (rewindIdx !== void 0) {
        const currentBlock = slots[currentSlotIdx].block;
        const targetBlock = slots[rewindIdx].block;
        if (loopStarters.has(type) && currentBlock === targetBlock) {
          matchIdx = rewindIdx;
        }
      }
    }
    if (matchIdx === void 0) {
      const idealIdx = potentialMatches[0];
      let blocker = null;
      for (let j = 0; j < i; j++) {
        if (assignedSlots[j] !== null && assignedSlots[j] > idealIdx) {
          blocker = { line: j + 1, type: getRecordType(lines[j]) };
          break;
        }
      }
      if (blocker) {
        problems.push(`Record "${type}" at line ${i + 1} is out of sequence; it should appear before "${blocker.type}" at line ${blocker.line}.`);
      } else {
        problems.push(`Out-of-sequence record "${type}" at line ${i + 1}.`);
      }
      continue;
    }
    currentSlotIdx = matchIdx;
    assignedSlots[i] = matchIdx;
  }
  return { ok: problems.length === 0, problems };
}
__name(validateRecordOrder, "validateRecordOrder");

// src/cwr-sdk/validators/sequenceOrderValidator.ts
function parseSeqFields(line) {
  if (!line || line.length < 19) return null;
  const txRaw = line.substring(3, 11);
  const recRaw = line.substring(11, 19);
  if (!/^\d{8}$/.test(txRaw) || !/^\d{8}$/.test(recRaw)) return null;
  return {
    transactionSeqRaw: txRaw,
    recordSeqRaw: recRaw,
    transactionSeq: parseInt(txRaw, 10),
    recordSeq: parseInt(recRaw, 10)
  };
}
__name(parseSeqFields, "parseSeqFields");
function validateSequenceNumbers(lines) {
  const ignore = /* @__PURE__ */ new Set(["HDR", "GRH", "GRT", "TRL"]);
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
    if (!sawWorkStart && ["NWR", "REV", "ISW", "EXC"].includes(type)) {
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
        `RecordSeq mismatch at line ${i + 1} (${type}): expected ${String(expectedRecordSeq).padStart(8, "0")} but got ${seq.recordSeqRaw}.`
      );
      expectedRecordSeq = actual + 1;
    } else {
      expectedRecordSeq++;
    }
  }
  if (!sawAnyNumberedRecord) {
    return { ok: true, problems: [] };
  }
  return {
    ok: problems.length === 0,
    problems
  };
}
__name(validateSequenceNumbers, "validateSequenceNumbers");

// src/cwr-sdk/parser/blockExtractor.ts
function detectWorkRecordType(lines) {
  const grh = lines.find((l) => getRecordType(l) === "GRH");
  if (!grh) return "NWR";
  const transactionType = grh.substring(3, 6).trim();
  if (transactionType === "REV") return "REV";
  if (transactionType === "ACK") return "ACK";
  return "NWR";
}
__name(detectWorkRecordType, "detectWorkRecordType");
function splitIntoWorkBlocks(rawText) {
  const lines = tokenize(rawText);
  const hdr = lines.find((l) => getRecordType(l) === "HDR") || null;
  let lastGrh = null;
  const workRecordType = detectWorkRecordType(lines);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const type = getRecordType(line);
    if (type === "HDR") {
      continue;
    }
    if (type === "GRH") {
      lastGrh = line;
      continue;
    }
    if (type === workRecordType) {
      if (current) blocks.push(current);
      current = [];
      if (blocks.length === 0 && hdr) {
        current.push(hdr);
      }
      if (lastGrh) {
        current.push(lastGrh);
      }
    }
    if (current) current.push(line);
  }
  if (current && current.length > 0) {
    blocks.push(current);
  }
  return { hdr, workRecordType, blocks };
}
__name(splitIntoWorkBlocks, "splitIntoWorkBlocks");
function extractFirstWorkPreview(rawText) {
  const { hdr, workRecordType, blocks } = splitIntoWorkBlocks(rawText);
  if (!hdr) {
    return {
      workRecordType,
      preview: "(HDR missing)",
      lines: [],
      additional: 0
    };
  }
  if (blocks.length === 0) {
    return {
      workRecordType,
      preview: hdr + "\n(No work blocks found)",
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
    lines: firstBlock,
    // IMPORTANT: now an ARRAY
    additional: blocks.length - 1,
    orderValidation,
    sequenceValidation
  };
}
__name(extractFirstWorkPreview, "extractFirstWorkPreview");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectWorkRecordType,
  extractFirstWorkPreview,
  splitIntoWorkBlocks
});
//# sourceMappingURL=edi-preview.cjs.map