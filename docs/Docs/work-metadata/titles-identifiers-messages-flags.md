---
title: 'Titles, Identifiers, Messages, Flags'
metadata:
  robots: index
privacy:
  view: public
---
# Titles

The `titles` array contains all title entries for the work. Each element comes from one of three CWR record types.

## Fields

| Field      | Type   | Req | Description                                                                          |
| ---------- | ------ | --- | ------------------------------------------------------------------------------------ |
| `value`    | string | M   | The title text                                                                       |
| `type`     | string | O   | CWR title type code — see [Title Types](./role-codes-rights-title-types#title-types) |
| `language` | string | O   | ISO language code (e.g., `"JA"`, `"ZH"`, `"KO"`). Present on `NAT` titles only.      |

## Sources

| CWR Record    | `type` value | Notes                                        |
| ------------- | ------------ | -------------------------------------------- |
| `NWR` / `REV` | `"TT"`       | The main registration title                  |
| `ALT`         | `"ALT"`      | Alternate title                              |
| `NAT`         | `"NAT"`      | Non-Roman alphabet title; carries `language` |

**Deduplication:** `{value, type}` pairs that appear more than once are collapsed to a single entry.

## Example

```json
"titles": [
  { "value": "BOHEMIAN RHAPSODY", "type": "TT" },
  { "value": "BOHEMIAN RHAP", "type": "ALT" },
  { "value": "ボヘミアン・ラプソディ", "type": "NAT", "language": "JA" }
]
```

***

# Foundational identifiers

ISWC and a work-level ISRC cross-reference are string arrays. They are not rows in `identifiers[]`.

| Field | Type | Req | CWR source |
| --- | --- | --- | --- |
| `iswc` | string[] | O | `NWR` / `REV` `ISWC`, `XRF` org `ISW` |
| `isrc` | string[] | O | `XRF` org `ISR` when no recording already holds that ISRC |

Parser output writes every recognized ISWC as dotted ISO `T-NNN.NNN.NNN-C`. The schema also accepts compact `TNNNNNNNNNC` and intermediate `T-NNNNNNNNN-C`.

# Generic identifiers

`identifiers[]` holds namespaced work ids. Each item is `type`, then `value`, then optional `source`. Match on `source.type` and `source.value`. `source.name` is optional.

| Field | Type | Req | Description |
| --- | --- | --- | --- |
| `type` | string | M | `publisherWorkId`, `societyWorkId`, `submitterWorkId`, `assetId`, or `proprietary` |
| `value` | string | M | The identifier |
| `source` | object | O | Who assigned it. Omitted for `proprietary` |
| `source.type` | string | M | `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid` |
| `source.value` | string | M | The assigner id |
| `source.name` | string | O | Display name |

### EDI mapping

| CWR source | `type` | `source` |
| --- | --- | --- |
| `NWR.SubmitterWorkNumber` | `submitterWorkId` | `cwrSubmitter`, value from `HDR` sender id, name from sender name |
| `XRF` numeric society code (e.g. `035`) | `societyWorkId` | `cisacSociety`, value is the org code |
| `XRF` 2–3 letter code (e.g. `EMI`) | `publisherWorkId` | `cwrSubmitter`, value is the org code |
| `XRF` with no org | `proprietary` | omitted |
| `XRF` org `000` or `099` | _(skipped)_ | — |
| `XRF` org `ISW` | — | appended to `iswc` |
| `XRF` org `ISR` | — | recording `isrc` if it already matches, otherwise `works[].isrc` |

All `Validity` values (`Y`, `N`, `U`) are emitted. The same ISWC from `NWR` and `XRF` `ISW` is stored once. Triples match on `type`, `value`, `source.type`, and `source.value`.

Recordings may carry `identifiers[]` when an asset id is present. Current EDI does not produce asset ids. The schema allows `{ "type": "assetId", "source": { "type": "dpid", "value": "..." } }`.

## Example

```json
"iswc": ["T-034.524.680-1"],
"identifiers": [
  {
    "type": "submitterWorkId",
    "value": "SW00000000001",
    "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "TEST PUBLISHER" }
  },
  {
    "type": "societyWorkId",
    "value": "3987389001",
    "source": { "type": "cisacSociety", "value": "035" }
  },
  {
    "type": "publisherWorkId",
    "value": "EMI-00042",
    "source": { "type": "cwrSubmitter", "value": "EMI" }
  }
]
```

***

# Messages

The `messages` object carries registration metadata, status flags, and ACK message content.

## Fields

| Field                      | Type   | Req | Source                        | Description                                     |
| -------------------------- | ------ | --- | ----------------------------- | ----------------------------------------------- |
| `type`                     | string | O   | `NWR` / `REV` record type     | `"nwr"` or `"rev"` (lowercased)                 |
| `revocation`               | object | O   | `NWR.RevocationIndicator`     | Present if the work was flagged for revocation  |
| `revocation.indicator`     | string | M   | `NWR.RevocationIndicator`     | Raw indicator value                             |
| `revocation.reason`        | string | O   | `NWR.RevocationReason`        | Human-readable reason                           |
| `relinquishment`           | object | O   | `NWR.RelinquishmentIndicator` | Present if a relinquishment indicator appears   |
| `relinquishment.indicator` | string | M   | `NWR.RelinquishmentIndicator` | Raw indicator value                             |
| `msgs`                     | array  | O   | `MSG` records                 | ACK file messages — each: `{ status, message }` |
| `schema`                   | string | M   | _(injected by schemaV1)_      | Schema label used for this output               |
| `schemaDescription`        | string | M   | _(injected by schemaV1)_      | Schema description                              |
| `societySpecific`          | object | O   | _(reserved)_                  | Reserved for society-specific extension data    |

## Example

```json
"messages": {
  "type": "nwr",
  "revocation": {
    "indicator": "Y",
    "reason": "Duplicate registration"
  }
}
```

***

# Flags

The `flags` object holds boolean and indicator fields extracted from the `NWR` / `REV` record.

## Fields

| Field             | Type    | Req | Source Field                 | Description                                                                         |
| ----------------- | ------- | --- | ---------------------------- | ----------------------------------------------------------------------------------- |
| `anomalous`       | boolean | O   | `NWR.AnomalousWorkIndicator` | `true` if the work is marked anomalous (`"Y"` → `true`)                             |
| `anomalousReason` | string  | O   | `NWR.AnomalousWorkReason`    | Reason text for the anomalous flag                                                  |
| `aiUsage`         | string  | O   | `NWR.AIIndicator`            | AI content usage indicator. Values: `"M"` (music), `"T"` (text), `"B"` (both), etc. |
| `fraudulent`      | boolean | O   | _(reserved)_                 | Reserved for future use                                                             |

## Example

```json
"flags": {
  "anomalous": true,
  "anomalousReason": "Non-standard work structure",
  "aiUsage": "M"
}
```

<br />
