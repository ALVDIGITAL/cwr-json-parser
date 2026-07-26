---
title: CWR two-way conversion
metadata:
  robots: index
content:
  excerpt: >-
    The CWR-JSON core schema is a faithful JSON expression of CWR 2.2 Revision
    3. Any valid CWR 2.2 Revision 3 EDI file must be convertible into CWR-JSON,
    and that CWR-JSON shall be convertible back into CWR 2.2 Revision 3 EDI. The
    mapping below shows how CWR EDI records and fields are represented as JSON
    elements. It is intended to make the relationship between the original CWR
    structure and the CWR-JSON structure clear, so implementers can understand
    where each piece of data belongs.
privacy:
  view: public
---

# NWR / REV — Work Registration Header

The `NWR` and `REV` records are the root of every CWR transaction.

## Mapping

| CWR EDI Field | JSON Path | Notes |
|---|---|---|
| Record type | `work.messages.type` | Lowercased: `"nwr"`, `"rev"`, or `"ack"` |
| `Title` / `WorkTitle` | `work.titles[]` | `{ value, type: "TT" }` |
| `ISWC` | `work.identifiers[]` | `{ source: "iswc", value }` |
| `SubmitterWorkNumber` | `work.identifiers[]` | `{ source: "submitterWorkNumber", value }` |
| `RevocationIndicator` | `work.messages.revocation.indicator` | |
| `RevocationReason` | `work.messages.revocation.reason` | |
| `AnomalousWorkIndicator` | `work.flags.anomalous` | `"Y"` → `true` |
| `AnomalousWorkReason` | `work.flags.anomalousReason` | |
| `AIIndicator` | `work.flags.aiUsage` | Raw value preserved |

## Notes
- For `REV`: all work fields must be re-submitted in full. Structure is identical to `NWR`.
- For `REV` with `RevocationIndicator = "Y"`: the work is being revoked.

---

# XRF — Work ID Cross Reference

CWR 2.2 **`XRF`** records carry additional work identifiers (society work numbers, ISWC/ISRC cross-refs, submitter IDs).

## Mapping

| CWR EDI Field | JSON Path | Notes |
|---|---|---|
| `OrganisationCode = ISW` | `work.identifiers[]` | `{ source: "iswc", value: Identifier }` |
| `OrganisationCode = ISR` | `work.identifiers[]` | `{ source: "isrc", value: Identifier }` |
| Other `OrganisationCode` | `work.identifiers[]` | `{ source: <OrganisationCode>, value: Identifier }` (e.g. `"035"`, `"EMI"`) |
| `OrganisationCode` `000` / `099` | — | Skipped |
| `Validity` | — | Not emitted in JSON (all Y/N/U rows included) |

## Notes

- Duplicate `{source, value}` pairs are deduplicated against `NWR`/`REV` and other `XRF` rows.
- `REC` recordings are unchanged; `ISR` XRF also appears in `identifiers[]` (not auto-merged into `recordings[]`).

---
