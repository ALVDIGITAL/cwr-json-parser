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

# Identifiers

The `identifiers` array contains all identifiers assigned to the work.

## Fields

| Field    | Type   | Req | Description                                                                                         |
| -------- | ------ | --- | --------------------------------------------------------------------------------------------------- |
| `source` | string | M   | Identifier namespace — see [Identifier Sources](./role-codes-rights-title-types#identifier-sources) |
| `value`  | string | M   | The identifier value                                                                                |

## Sources

| `source`                | CWR Source Field          | Description                                  |
| ----------------------- | ------------------------- | -------------------------------------------- |
| `"iswc"`                | `NWR.ISWC`                | International Standard Work Code (ISO 15707) |
| `"submitterWorkNumber"` | `NWR.SubmitterWorkNumber` | Submitter's internal work number             |
| `"proprietary"`         | _(varies)_                | Other proprietary identifier                 |

## Example

```json
"identifiers": [
  { "source": "iswc", "value": "T-000.000.001-0" },
  { "source": "submitterWorkNumber", "value": "EMI-00042" }
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
