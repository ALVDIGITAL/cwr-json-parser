# ACK + MSG Records (A+B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CISAC ACK/MSG field layouts for EDI preview and map ACK + MSG into flat v1 `messages` (including richer `msgs[]`).

**Architecture:** Extend `recordDefinitions` so `parseRecordLine` emits real columns; teach `detectWorkRecordType` / `splitIntoWorkBlocks` to treat GRH `ACK` as work-start on `ACK` rows; map ACK fields + MSG into `messages` in `buildWorkModel` without letting nested NWR overwrite `type: "ack"`; extend JSON Schema + docs. Spec: `docs/specs/CWR19-1070R3_…_EN.md` §4.6 / §5.26. Design: `docs/superpowers/specs/2026-07-25-ack-msg-records-design.md`.

**Tech Stack:** TypeScript, Vitest (or existing test runner), existing CWR SDK (`recordDefinitions`, `buildWorkModel`, `schemaV1`).

## Global Constraints

- Field positions must match CISAC CWR 2.2 Rev3 exactly (MSG `MessageType` size **1**, not 3).
- v1 `messages` ACK fields are **flat** camelCase; `msgs[]` = `{ status, message, originalRecordSequence, recordType, messageLevel, validationNumber }`.
- Do **not** register or “fix” `schemaAck.ts` in this work.
- Do **not** invent AGR/EXC JSON nodes; nested NWR/REV detail mapping stays as today.
- Real fixture already at `test/files/151708_CW260050035_MDW.V22` (92 ACK+NWR, 1 MSG before OWR, all status `AC`).

---

## File map

| File | Role |
|------|------|
| `src/cwr-sdk/types/recordDefinitions.ts` | Add `ACK` + `MSG` layouts |
| `src/cwr-sdk/parser/blockExtractor.ts` | Detect/split ACK transactions |
| `src/cwr-sdk/mapper/workModel/buildWorkModel.ts` | Map ACK + MSG → `messages` |
| `src/cwr-sdk/types/cwr.ts` | Type `Messages` / msgs item |
| `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json` | Enum + properties |
| `src/cwr-sdk/validators/recordOrderValidator.ts` | Allow ACK start; ignore/allow MSG |
| `test/helpers/cwrFixtures.ts` | Synthetic ACK builder helpers |
| `test/…` (new or existing) | Field parse, split, parseCwr tests |
| `docs/Docs/work-metadata/titles-identifiers-messages-flags.md` | Document ACK fields |
| `docs/Docs/overview/changelog.md` | Note ACK/MSG support |

---

### Task 1: ACK/MSG `recordDefinitions` + field-parse tests

**Files:**
- Modify: `src/cwr-sdk/types/recordDefinitions.ts`
- Create or extend: `test/recordParser.ackMsg.test.ts` (name to match repo test style — check `test/` for pattern)
- Test: same

**Interfaces:**
- Produces: `recordDefinitions.ACK`, `recordDefinitions.MSG` consumed by `parseRecordLine`

- [ ] **Step 1: Find existing test pattern**

Run: `Get-ChildItem test -Recurse -Filter *.ts | Select-Object -First 20 FullName`  
Open one parser-related test if present; mirror its import/`describe` style.

- [ ] **Step 2: Write failing tests for ACK/MSG field parse**

```ts
import { parseRecordLine } from '../src/cwr-sdk/parser/recordParser'; // adjust import to project style
import { readFileSync } from 'fs';
import { join } from 'path';

const mdw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean);

const ack = mdw.find((l) => l.startsWith('ACK'))!;
const msg = mdw.find((l) => l.startsWith('MSG'))!;

it('parses ACK into real columns (not Raw)', () => {
  const { type, fields } = parseRecordLine(ack);
  expect(type).toBe('ACK');
  expect(fields.some((f) => f.label === 'Raw')).toBe(false);
  const by = Object.fromEntries(fields.map((f) => [f.label, f.value.trim()]));
  expect(by.CreationDate).toBe('20260716');
  expect(by.CreationTime).toBe('113954');
  expect(by.OriginalGroupId).toBe('00001');
  expect(by.OriginalTransactionType).toBe('NWR');
  expect(by.TransactionStatus).toBe('AC');
  expect(by.SubmitterCreationNumber).toContain('ALV003306733PW');
});

it('parses MSG into real columns (MessageType size 1)', () => {
  const { type, fields } = parseRecordLine(msg);
  expect(type).toBe('MSG');
  expect(fields.some((f) => f.label === 'Raw')).toBe(false);
  const by = Object.fromEntries(fields.map((f) => [f.label, f.value.trim()]));
  expect(by.MessageType).toBe('F');
  expect(by.OriginalRecordSequence).toBe('00000008');
  expect(by.MessageRecordType).toBe('OWR');
  expect(by.MessageLevel).toBe('F');
  expect(by.ValidationNumber).toBe('009');
  expect(by.MessageText).toMatch(/WRITER CAE/);
});
```

- [ ] **Step 3: Run tests — expect FAIL** (ACK/MSG → Raw fallback)

Run project test command for that file (see `package.json` scripts, usually `npm test -- …`).

- [ ] **Step 4: Add definitions**

Append to `recordDefinitions` (same style as NWR):

```ts
ACK: [
  { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
  { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
  { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
  { label: "CreationDate", start: 20, length: 8, type: "N", mandatory: true },
  { label: "CreationTime", start: 28, length: 6, type: "N", mandatory: true },
  { label: "OriginalGroupId", start: 34, length: 5, type: "N", mandatory: true },
  { label: "OriginalTransactionSeq", start: 39, length: 8, type: "N", mandatory: true },
  { label: "OriginalTransactionType", start: 47, length: 3, type: "L", mandatory: true },
  { label: "CreationTitle", start: 50, length: 60, type: "A", mandatory: false },
  { label: "SubmitterCreationNumber", start: 110, length: 20, type: "A", mandatory: false },
  { label: "RecipientCreationNumber", start: 130, length: 20, type: "A", mandatory: false },
  { label: "ProcessingDate", start: 150, length: 8, type: "N", mandatory: true },
  { label: "TransactionStatus", start: 158, length: 2, type: "L", mandatory: true },
],
MSG: [
  { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
  { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
  { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
  { label: "MessageType", start: 20, length: 1, type: "L", mandatory: true },
  { label: "OriginalRecordSequence", start: 21, length: 8, type: "N", mandatory: true },
  { label: "MessageRecordType", start: 29, length: 3, type: "A", mandatory: true },
  { label: "MessageLevel", start: 32, length: 1, type: "L", mandatory: true },
  { label: "ValidationNumber", start: 33, length: 3, type: "A", mandatory: true },
  { label: "MessageText", start: 36, length: 150, type: "A", mandatory: true },
],
```

- [ ] **Step 5: Re-run tests — expect PASS**

- [ ] **Step 6: Commit**

```bash
git add src/cwr-sdk/types/recordDefinitions.ts test/recordParser.ackMsg.test.ts
git commit -m "$(cat <<'EOF'
feat: add ACK/MSG field layouts for EDI preview

EOF
)"
```

(On Windows PowerShell use a here-string or `git commit -m "feat: add ACK/MSG field layouts for EDI preview"`.)

---

### Task 2: ACK block detection / split

**Files:**
- Modify: `src/cwr-sdk/parser/blockExtractor.ts`
- Modify: `src/cwr-sdk/validators/recordOrderValidator.ts` (minimal)
- Create/extend: `test/blockExtractor.ack.test.ts`

**Interfaces:**
- Consumes: GRH TransactionType at cols 4–6
- Produces: `workRecordType: "ACK"`; blocks starting on each `ACK` line

- [ ] **Step 1: Write failing split tests**

```ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { detectWorkRecordType, splitIntoWorkBlocks } from '../src/cwr-sdk/parser/blockExtractor';

const raw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);

it('detects ACK transaction type', () => {
  expect(detectWorkRecordType(lines)).toBe('ACK');
});

it('splits one block per ACK (nested NWR stays inside)', () => {
  const { workRecordType, blocks } = splitIntoWorkBlocks(raw);
  expect(workRecordType).toBe('ACK');
  expect(blocks.length).toBe(92);
  const first = blocks[0];
  expect(first.some((l) => l.startsWith('ACK'))).toBe(true);
  expect(first.some((l) => l.startsWith('NWR'))).toBe(true);
});
```

- [ ] **Step 2: Run — expect FAIL** (`workRecordType` is `NWR`, blocks wrong)

- [ ] **Step 3: Implement detection**

In `detectWorkRecordType`:

```ts
export function detectWorkRecordType(lines: string[]): string {
  const grh = lines.find(l => getRecordType(l) === 'GRH');
  if (!grh) return 'NWR';
  const transactionType = grh.substring(3, 6).trim();
  if (transactionType === 'REV') return 'REV';
  if (transactionType === 'ACK') return 'ACK';
  return 'NWR';
}
```

`splitIntoWorkBlocks` already starts blocks on `workRecordType` — no change needed once detection returns `ACK`.

- [ ] **Step 4: Order validator light touch**

In `recordOrderValidator.ts`:
- Add `'ACK'` and `'MSG'` to `ignore` **or** treat ACK like work-start alongside NWR/REV and ignore MSG for slot matching.
- Preferred: `ignore` adds `MSG`; work-start set becomes `['ACK','NWR','REV','ISW','EXC']` with rule: if ACK present, nested NWR/REV does not count as second work-start.

Concrete approach:

```ts
const ignore = new Set(['HDR', 'GRH', 'GRT', 'TRL', 'MSG']);
// ...
if (['ACK', 'NWR', 'REV', 'ISW', 'EXC'].includes(type)) {
  if (sawWorkStart && type !== 'NWR' && type !== 'REV' && type !== 'ISW' && type !== 'EXC') {
    // second ACK only would be wrong inside one block — normally not in single block
  }
  if (type === 'ACK') {
    if (sawWorkStart) {
      problems.push(`Unexpected ACK at line ${i + 1}`);
    }
    sawWorkStart = true;
    currentSlotIdx = 0;
    continue; // ACK is transaction header, not a detail slot
  }
  // existing NWR/REV/ISW/EXC logic...
}
```

Refine so nested NWR after ACK does **not** push “Unexpected NWR” — e.g. allow one NWR/REV after ACK:

```ts
let ackHeader = false;
if (type === 'ACK') {
  if (sawWorkStart) problems.push(...);
  sawWorkStart = true;
  ackHeader = true;
  currentSlotIdx = 0;
  continue;
}
if (['NWR', 'REV', 'ISW', 'EXC'].includes(type)) {
  if (sawWorkStart && !ackHeader) {
    problems.push(`Unexpected ${type}...`);
  }
  sawWorkStart = true;
  ackHeader = false;
  currentSlotIdx = 0;
}
```

(Keep change minimal; add a focused order test on first MDW block if preview asserts `orderValidation.ok`.)

- [ ] **Step 5: Run tests — PASS**

- [ ] **Step 6: Commit**

```bash
git add src/cwr-sdk/parser/blockExtractor.ts src/cwr-sdk/validators/recordOrderValidator.ts test/blockExtractor.ack.test.ts
git commit -m "feat: split ACK transaction blocks for EDI preview"
```

---

### Task 3: Map ACK + MSG into `messages` (canonical / v1)

**Files:**
- Modify: `src/cwr-sdk/mapper/workModel/buildWorkModel.ts`
- Modify: `src/cwr-sdk/types/cwr.ts`
- Create/extend: `test/parseCwr.ack.test.ts`
- Optional: `test/helpers/cwrFixtures.ts` — `minimalAckCwr()` helper

**Interfaces:**
- Consumes: parsed ACK/MSG field objects from `lineToObj`
- Produces: flat `messages` + `msgs[]` as in design doc

- [ ] **Step 1: Write failing parseCwr test on MDW**

```ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCwr } from '../src'; // adjust to public entry

const raw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8');

it('maps ACK fields flat onto messages and keeps nested NWR titles', () => {
  const out = parseCwr(raw);
  expect(out.works.length).toBe(92);
  const w0 = out.works[0];
  expect(w0.messages.type).toBe('ack');
  expect(w0.messages.transactionStatus).toBe('AC');
  expect(w0.messages.creationDate).toBe('20260716');
  expect(w0.messages.originalTransactionType).toBe('NWR');
  expect(String(w0.messages.creationTitle)).toMatch(/COWBOYS/);
  expect(w0.titles?.some((t: any) => t.type === 'TT')).toBe(true);
});

it('maps MSG into msgs with extras', () => {
  const out = parseCwr(raw);
  const withMsg = out.works.find((w: any) => Array.isArray(w.messages.msgs) && w.messages.msgs.length);
  expect(withMsg).toBeTruthy();
  const m = withMsg!.messages.msgs![0];
  expect(m.status).toBe('F');
  expect(m.recordType).toBe('OWR');
  expect(m.messageLevel).toBe('F');
  expect(m.validationNumber).toBe('009');
  expect(m.message).toMatch(/WRITER CAE/);
});
```

- [ ] **Step 2: Run — expect FAIL** (blocks as NWR or empty ACK fields / heuristic msgs)

- [ ] **Step 3: Update `Messages` type in `cwr.ts`**

```ts
msgs?: {
  status?: string;
  message?: string;
  originalRecordSequence?: string;
  recordType?: string;
  messageLevel?: string;
  validationNumber?: string;
}[];
// allow flat ACK fields via existing index signature or explicit props:
creationDate?: string;
creationTime?: string;
originalGroupId?: string;
originalTransactionSequence?: string;
originalTransactionType?: string;
creationTitle?: string;
submitterCreationNumber?: string;
recipientCreationNumber?: string;
processingDate?: string;
transactionStatus?: string;
```

- [ ] **Step 4: Implement ACK + MSG handlers; protect `type`**

Replace MSG heuristic; add ACK before NWR branch:

```ts
if (type === 'ACK') {
  model.messages.type = 'ack';
  model.messages.creationDate = (obj.CreationDate || '').trim();
  model.messages.creationTime = (obj.CreationTime || '').trim();
  model.messages.originalGroupId = (obj.OriginalGroupId || '').trim();
  model.messages.originalTransactionSequence = (obj.OriginalTransactionSeq || '').trim();
  model.messages.originalTransactionType = (obj.OriginalTransactionType || '').trim();
  model.messages.creationTitle = (obj.CreationTitle || '').trim();
  model.messages.submitterCreationNumber = (obj.SubmitterCreationNumber || '').trim();
  model.messages.recipientCreationNumber = (obj.RecipientCreationNumber || '').trim();
  model.messages.processingDate = (obj.ProcessingDate || '').trim();
  model.messages.transactionStatus = (obj.TransactionStatus || '').trim();
  continue;
}

if (type === 'MSG') {
  const msgs = (model.messages.msgs as any[]) || [];
  msgs.push({
    status: (obj.MessageType || '').trim(),
    message: (obj.MessageText || '').trim(),
    originalRecordSequence: (obj.OriginalRecordSequence || '').trim(),
    recordType: (obj.MessageRecordType || '').trim(),
    messageLevel: (obj.MessageLevel || '').trim(),
    validationNumber: (obj.ValidationNumber || '').trim(),
  });
  model.messages.msgs = msgs;
  continue;
}

if (type === 'NWR' || type === 'REV') {
  if (model.messages.type !== 'ack') {
    model.messages.type = type.toLowerCase();
  }
  // ... existing title/identifier/flag mapping unchanged
}
```

- [ ] **Step 5: Ensure `parseAllWorks` / pipeline uses updated block split**  
Confirm works are built per ACK block (same path as NWR). If pipeline still forces NWR-only, fix that call site.

- [ ] **Step 6: Run tests — PASS**

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: map ACK and MSG into v1 messages"
```

---

### Task 4: JSON Schema + docs

**Files:**
- Modify: `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json`
- Modify: `docs/Docs/work-metadata/titles-identifiers-messages-flags.md`
- Modify: `docs/Docs/overview/changelog.md`
- Modify: `docs/Docs/getting-started.md` (ACK “planned” → supported for preview + v1 messages)

- [ ] **Step 1: Schema**

In `MessageType.enum` add `"ack"`.  
Under `Messages.properties` add optional string fields listed in design.  
Under `msgs.items.properties` add `originalRecordSequence`, `recordType`, `messageLevel`, `validationNumber`.

- [ ] **Step 2: Docs**

Document flat ACK fields + richer `msgs` example (use MDW-like sample). Update changelog bullet: ACK/MSG field preview + v1 mapping.

- [ ] **Step 3: Run full test suite**

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: document ACK/MSG messages mapping"
```

---

### Task 5: Self-check against real file + design

- [ ] **Step 1:** Re-run all ACK/MSG tests + full suite  
- [ ] **Step 2:** Spot-check: `parseRecordLine` on MDW ACK/MSG; `parseCwr` work index that contains MSG (~txn 41)  
- [ ] **Step 3:** Confirm `schemaAck` untouched and still unregistered  
- [ ] **Step 4:** Final commit only if leftover fixes

---

## Spec coverage

| Design requirement | Task |
|--------------------|------|
| A: ACK/MSG columns | Task 1 |
| A: ACK block preview | Task 2 |
| B: flat ACK on messages | Task 3 |
| B: rich msgs[] | Task 3 |
| Nested NWR still maps | Task 3 |
| type stays ack | Task 3 |
| Schema/docs | Task 4 |
| Real MDW fixture | Tasks 1–3 |

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-07-25-ack-msg-records.md`.

**1. Subagent-Driven (recommended)** — fresh subagent per task + review between  
**2. Inline Execution** — same session with checkpoints  

Which approach?
