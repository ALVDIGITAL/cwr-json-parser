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
| `ISWC` | `work.identifiers[].iswc[]` | Dotted ISO `T-NNN.NNN.NNN-C`. One `{ iswc }` entry |
| `SubmitterWorkNumber` | `work.identifiers[]` | `{ type: "submitterWorkId", value, source: { type: "cwrSubmitter", value: HDR sender id, name } }` |
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
| `IdentifierType = W`, org `ISW` | `work.identifiers[].iswc[]` | Dotted ISO. Deduped with `NWR` / `REV` ISWC |
| `IdentifierType = W`, numeric society code | `work.identifiers[]` | `{ type: "societyWorkId", source: { type: "cisacSociety", value: org } }` |
| `IdentifierType = W`, 2–3 letter submitter code | `work.identifiers[]` | `{ type: "publisherWorkId", source: { type: "cwrSubmitter", value: org } }` |
| `IdentifierType = W`, other or missing org | `work.identifiers[]` | `{ type: "proprietary", value }` and no `source` |
| `IdentifierType = R`, valid ISRC | `recordings[].isrc[]` | Matching recording ISRC is not copied. Each unmatched code is its own recording shell |
| `IdentifierType = P`, 13-digit EAN | `recordings[].releases[].ean[]` | Its own recording with one release. Not attached to other recordings |
| `IdentifierType = V` | — | Not mapped |
| `OrganisationCode` `000` / `099` | — | Skipped |
| `Validity` | — | Not emitted in JSON (all Y/N/U rows included) |

## Notes

- Triples match on `type`, `value`, `source.type`, and `source.value`.
- `REC.ISRC` is one entry in `recordings[].isrc[]`. `REC` EAN is `releases[].ean[]`. Catalog number stays on `releases[].catno`.

---
