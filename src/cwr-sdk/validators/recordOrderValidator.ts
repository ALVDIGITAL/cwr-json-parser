
// Validates record ordering inside a single work block according to the CWR 2.2 (edit 43) record sequence:
// NWR/REV/ISW/EXC, SPU, NPN, SPT, OPT, OPU, NPN, OPT, SWR, NWN, SWT, PWR, OWR, NWN, OWT, PWR, ALT, NAT,
// EWT, NET, NOW, VER, NVT, NOW, PER, NPR, REC, ORN, INS, IND, COM, NCT, NOW, ARI, XRF.
//
// Notes:
// - Many records are optional and many can repeat (e.g., multiple SWR/OWR/SPU/OPU/ALT/NAT/REC/...).
// - Some record types appear in multiple positions (e.g., NPN, OPT, NOW, PWR). This is handled by
//   advancing through "slots" in order. A record is valid if it can be placed into some slot at or after
//   the current slot. If it would require going backwards, it’s invalid.

import { getRecordType } from "../parser/prefix";

// - Envelope records (HDR/GRH/GRT/TRL) are ignored here.
export function validateRecordOrder(lines: string[]): { ok: boolean; problems: string[] } {
  const ignore = new Set(['HDR', 'GRH', 'GRT', 'TRL']);

  // 1. Define Slots and their corresponding Functional Blocks
  const slots = [
    { type: ['NWR', 'REV', 'ISW', 'EXC'], block: 0 },
    { type: ['SPU'], block: 1 }, // Publisher Block Starts
    { type: ['NPN'], block: 1 },
    { type: ['SPT'], block: 1 },
    { type: ['OPT'], block: 1 },
    { type: ['OPU'], block: 2 }, // Other Publisher Block
    { type: ['NPN'], block: 2 },
    { type: ['OPT'], block: 2 },
    { type: ['SWR'], block: 3 }, // Writer Block Starts
    { type: ['NWN'], block: 3 },
    { type: ['SWT'], block: 3 },
    { type: ['PWR'], block: 3 },
    { type: ['OWR'], block: 4 }, // Other Writer Block
    { type: ['NWN'], block: 4 },
    { type: ['OWT'], block: 4 },
    { type: ['PWR'], block: 4 },
    { type: ['ALT'], block: 5 }, // Titles Block Starts
    { type: ['NAT'], block: 5 },
    { type: ['EWT'], block: 5 },
    { type: ['NET'], block: 5 },
    { type: ['NOW'], block: 5 },
    { type: ['PER'], block: 6 }, // Performance Data Block
    { type: ['NPR'], block: 6 },
    { type: ['REC'], block: 7 }, // Recording Block
    { type: ['ORN'], block: 7 },
    { type: ['INS'], block: 7 },
    { type: ['IND'], block: 7 },
    { type: ['COM'], block: 7 },
    { type: ['NCT'], block: 7 },
    { type: ['NOW'], block: 7 },
    { type: ['ARI'], block: 8 },
    { type: ['XRF'], block: 8 },
  ];

  // Records that can trigger a loop within their own block
  const loopStarters = new Set(['SPU', 'OPU', 'SWR', 'OWR', 'ALT', 'NAT', 'PER', 'REC']);

  const problems = [];
  let currentSlotIdx = 0;
  let sawWorkStart = false;
  const assignedSlots = new Array(lines.length).fill(null);

  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;

    if (['NWR', 'REV', 'ISW', 'EXC'].includes(type)) {
      if (sawWorkStart) {
        problems.push(`Unexpected ${type} at line ${i + 1}; work blocks must start with a single NWR/REV/ISW/EXC.`);
      }
      sawWorkStart = true;
      currentSlotIdx = 0;
    }

    // Find the slot for this record type
    // We look at ALL slots to see where this record *could* live
    const potentialMatches = slots
      .map((s, idx) => (s.type.includes(type) ? idx : -1))
      .filter(idx => idx !== -1);

    if (potentialMatches.length === 0) {
      problems.push(`Record "${type}" at line ${i + 1} is not recognized in CWR 2.1/2.2.`);
      continue;
    }

    // Determine the best match based on current position
    let matchIdx = potentialMatches.find(idx => idx >= currentSlotIdx);

    // If no match is found forward, check if it's a valid "Rewind"
    if (matchIdx === undefined) {
      const rewindIdx = potentialMatches.find(idx => idx < currentSlotIdx);
      if (rewindIdx !== undefined) {
        const currentBlock = slots[currentSlotIdx].block;
        const targetBlock = slots[rewindIdx].block;

        // RULE: Rewind is only allowed if we stay in the SAME functional block
        if (loopStarters.has(type) && currentBlock === targetBlock) {
          matchIdx = rewindIdx;
        }
      }
    }

    if (matchIdx === undefined) {
      // Find what record "blocked" this one from being in the right place
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
