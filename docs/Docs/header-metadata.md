---
title: Header Metadata
metadata:
  robots: index
content:
  excerpt: >-
    This section defines the top-level CWR-JSON document structure and the
    metadata used to identify the sender, creation/transmission timestamps, and
    originating software.
privacy:
  view: public
---
## Top-level object

Every CWR-JSON file is a single JSON object. The reference implementation emits:

```json
{
  "header": { ... },
  "works":  [ ... ]
}
```

For interchange, a root `$schema` URL may be added (recommended; see [Schema Validation](./schema-validation)).

| Key       | Type   | Req | Description                                                                  |
| --------- | ------ | --- | ---------------------------------------------------------------------------- |
| `$schema` | string | O   | URL of the JSON Schema used to validate this file (recommended for exchange) |
| `header`  | object | O   | File-level metadata from the CWR `HDR` record                                |
| `works`   | array  | M   | One object per NWR / REV transaction                                         |

***

## File-level validation

| Rule                                                                                                | Rejection |
| --------------------------------------------------------------------------------------------------- | --------- |
| File must be parseable as valid JSON                                                                | ER        |
| `works` must be present and an array                                                                | ER        |
| Each work must include `messages` (with `schema` and `schemaDescription` in v1.0 Playground output) | TR / RR   |
| Transactions from multiple submitters cannot be co-mingled in one logical submission                | ER        |

> CWR-JSON is a JSON document, not a sequence of EDI records. Validation refers to JSON structure and semantics, not “first line = HDR”.

***

## HDR → `header`

The `header` object is derived from the CWR `HDR` record. The Playground currently maps these fields:

| Field              | Type   | Req | CWR Source         | Description                                                                                        |
| ------------------ | ------ | --- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `senderIdentifier` | string | O   | `SenderIdentifier` | Transmitter Code of the sender                                                                     |
| `senderName`       | string | O   | `SenderName`       | Legal name of the sending entity                                                                   |
| `creationDate`     | string | O   | `CreationDate`     | Format: `YYYYMMDD`                                                                                 |
| `creationTime`     | string | O   | `CreationTime`     | Format: `HHMMSS`                                                                                   |
| `version`          | string | O   | `Version`          | **CWR EDI version** from the source file (e.g. `"2.1"`, `"2.2"`) — not the CWR-JSON format version |
| `softwarePackage`  | string | O   | `SoftwarePackage`  | Software that generated the source file                                                            |

Additional HDR fields (`transmissionDate`, `characterSet`, `revision`, `softwarePackageVersion`) are defined in the TypeScript model and JSON Schema but are **not yet populated** by the mapper — see [Changelog](./changelog).

### Example

```json
"header": {
  "senderIdentifier": "EMI",
  "senderName": "EMI MUSIC PUBLISHING LTD",
  "creationDate": "20260101",
  "creationTime": "120000",
  "version": "2.1",
  "softwarePackage": "CWR-JSON Playground"
}
```

### Field-level validation

- `creationDate` and `creationTime`, when present, must conform to `YYYYMMDD` / `HHMMSS`. **(FR)**
- `version`, when present, should be a recognised CWR EDI version string from the source transmission. **(FR)**

***

## Data element types

All field values follow these type rules:

| Code | JSON type | Rules                                                                                                              |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| A    | string    | Valid UTF-8. Alphabetic codes in UPPER CASE.                                                                       |
| B    | boolean   | `true` or `false` (not `"Y"` / `"N"`)                                                                              |
| D    | string    | Date format `YYYYMMDD`. Use `"00000000"` when no date is available.                                                |
| N    | number    | Decimal percentage, e.g., `50.00`. Omit if null and optional.                                                      |
| T    | string    | Time/duration format `HHMMSS` (24-hour). Omit if null and optional.                                                |
| L    | string    | Lookup value. Valid values from a code table — see [Role Codes & related tables](./role-codes-rights-title-types). |

### Optional fields

Optional fields (Req = **O**) **must be omitted** from the JSON object if they have no value — do not include them as `null`.

```json
// ✅ Correct — omit optional fields with no value
{ "senderIdentifier": "EMI", "creationDate": "20260101" }

// ❌ Wrong — do not include null optional fields
{ "senderIdentifier": "EMI", "creationDate": "20260101", "characterSet": null }
```

<br />
