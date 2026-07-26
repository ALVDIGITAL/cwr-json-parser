# ACK + MSG records (A+B) — Design

**Date:** 2026-07-25  
**Scope:** A (field-level EDI preview columns) + B (v1 JSON `messages` mapping)  
**Spec source:** [CWR19-1070R3 … Rev3](../../specs/CWR19-1070R3_CWR_Functional_specifications_CWR_version_2-2_Rev3_2026-06-17_EN.md) §4.6 ACK, §5.26 MSG  
**Sample:** `test/files/151708_CW260050035_MDW.V22` (GEMA ACK, 92 ACK+NWR, 1 MSG)

## Decisions

| Topic | Choice |
|-------|--------|
| Approach | Extend existing `recordDefinitions` + `buildWorkModel` + `schemaV1` path (not revive `schemaAck`) |
| ACK fields on v1 | Flat on `messages` (`type: "ack"`, camelCase ACK fields) |
| `msgs[]` items | `{ status, message }` + MSG extras |
| Nested NWR/REV | Still map titles/identifiers/parties/flags; do **not** overwrite `messages.type` when already `"ack"` |
| Out of scope | Registering `schemaAck`; full AGR/EXC JSON nodes |

## A — Field layouts (`recordDefinitions`)

Prefix expanded as elsewhere: `RecordType` (1,3) + `TransactionSeq` (4,8) + `RecordSeq` (12,8).

### ACK (spec §4.6)

| Label | Start | Size |
|-------|-------|------|
| RecordType | 1 | 3 |
| TransactionSeq | 4 | 8 |
| RecordSeq | 12 | 8 |
| CreationDate | 20 | 8 |
| CreationTime | 28 | 6 |
| OriginalGroupId | 34 | 5 |
| OriginalTransactionSeq | 39 | 8 |
| OriginalTransactionType | 47 | 3 |
| CreationTitle | 50 | 60 |
| SubmitterCreationNumber | 110 | 20 |
| RecipientCreationNumber | 130 | 20 |
| ProcessingDate | 150 | 8 |
| TransactionStatus | 158 | 2 |

### MSG (spec §5.26) — Message Type is **1** char

| Label | Start | Size |
|-------|-------|------|
| RecordType | 1 | 3 |
| TransactionSeq | 4 | 8 |
| RecordSeq | 12 | 8 |
| MessageType | 20 | 1 |
| OriginalRecordSequence | 21 | 8 |
| MessageRecordType | 29 | 3 |
| MessageLevel | 32 | 1 |
| ValidationNumber | 33 | 3 |
| MessageText | 36 | 150 |

Verified against MDW sample ACK (len 159, status `AC`) and MSG (len 87, `F`/`OWR`/`F`/`009`).

## B — Block split + v1 map

### Block detection

- `detectWorkRecordType`: GRH txn `ACK` → `"ACK"` (keep `REV` → `REV`, else `NWR`).
- `splitIntoWorkBlocks`: start block on `workRecordType` line (`ACK` for ACK files). Nested `NWR`/`REV`/`MSG`/detail stay in same block until next `ACK`.

### `messages` (flat)

```json
{
  "type": "ack",
  "creationDate": "20260716",
  "creationTime": "113954",
  "originalGroupId": "00001",
  "originalTransactionSequence": "00000000",
  "originalTransactionType": "NWR",
  "creationTitle": "(WE ARE) THE COWBOYS",
  "submitterCreationNumber": "ALV003306733PW",
  "recipientCreationNumber": "0044170896001",
  "processingDate": "20260716",
  "transactionStatus": "AC",
  "msgs": [
    {
      "status": "F",
      "message": "WRITER CAE ENTERED NOT FOUND IN THE WRITER CAE TABLE",
      "originalRecordSequence": "00000008",
      "recordType": "OWR",
      "messageLevel": "F",
      "validationNumber": "009"
    }
  ],
  "schema": "...",
  "schemaDescription": "..."
}
```

### MSG mid-transaction

Spec: MSG precedes the detail record it applies to. Real MDW has MSG before `OWR` mid-block. Mapper must accept MSG anywhere in the loop (already line-loop). Order validator: ignore `ACK`/`MSG` or allow without failing preview.

### Schema

- `MessageType` enum: add `"ack"`.
- Document new `messages` properties + richer `msgs` item fields in JSON Schema + docs.

## Testing

1. Unit: `parseRecordLine` ACK/MSG → labeled fields (not Raw).
2. Unit: `detectWorkRecordType` / `splitIntoWorkBlocks` on MDW → `"ACK"`, 92 blocks.
3. Integration: `parseCwr` on MDW → first work `messages.type === "ack"`, flat fields, nested titles; work with MSG has `msgs[0]`.
4. Synthetic fixture via `cwrFixtures` for focused edge cases.
