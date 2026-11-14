---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    This section defines the top-level CWR-JSON document structure and the
    metadata used to identify the sender, creation/transmission timestamps, and
    originating software.
position: 6
privacy:
  view: public
slug: header-metadata
title: Header Metadata
---
## Top-level object

Every CWR-JSON file is a single JSON object (outline, not valid JSON):

```text
{
  "header": { ... },
  "works":  [ ... ]
}
```

| Key       | Type   | Req | Description                                                                  |
| --------- | ------ | --- | ---------------------------------------------------------------------------- |
| `header`  | object | O   | File-level metadata from the CWR `HDR` record, plus optional sender-supplied fields |
| `works`   | array  | M   | One object per `NWR` / `REV` / `ACK` transaction                             |

No other root properties are allowed. In format `1.0.1` this includes `$schema`: a file with a root `$schema` fails validation (see [Schema Validation](/docs/schema-validation#declaring-the-schema-version)).

***

## File-level validation

| Rule                                                                                                | Rejection |
| --------------------------------------------------------------------------------------------------- | --------- |
| File must be parseable as valid JSON                                                                | ER        |
| `works` must be present and an array                                                                | ER        |
| Each work must include `messages`, with `schema` and `schemaDescription`                            | TR / RR   |
| Transactions from multiple submitters cannot be co-mingled in one logical submission                | ER        |

> CWR-JSON is a JSON document, not a sequence of EDI records. Validation refers to JSON structure and semantics, not “first line = HDR”.

***

## HDR → `header`

The `header` object is derived from the CWR `HDR` record. Converters map these fields:

| Field              | Type   | Req | CWR Source         | Description                                                                                        |
| ------------------ | ------ | --- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `senderIdentifier` | string | O   | `SenderIdentifier` | Transmitter Code of the sender                                                                     |
| `senderName`       | string | O   | `SenderName`       | Legal name of the sending entity                                                                   |
| `creationDate`     | string | O   | `CreationDate`     | Format: `YYYYMMDD`                                                                                 |
| `creationTime`     | string | O   | `CreationTime`     | Format: `HHMMSS`                                                                                   |
| `version`          | string | O   | `Version`          | **CWR EDI version** from the source file (e.g. `"2.1"`, `"2.2"`) — not the CWR-JSON format version |
| `softwarePackage`  | string | O   | `SoftwarePackage`  | Software that generated the source file                                                            |
| `conventions`      | object | O   | —                  | File-level writer and publisher representation. Not mapped from `HDR`. Set on the JSON file.       |
| `tags`             | array  | O   | —                  | File-level tags. `{ name, value[] }`. Not mapped from `HDR`. Set on the JSON file.                 |

Write each `HDR` field only when it is present in the source `HDR`. A short (CWR 2.1-length) `HDR` has no `version` or `softwarePackage`, so those keys are absent.

The schema also allows `transmissionDate`, `characterSet`, `revision` and `softwarePackageVersion`. They correspond to the `HDR` fields of the same names. Format `1.0.1` does not require them, and the examples on these pages do not include them.

### Mapped from CWR EDI vs supplied by the sender

| Mapped from CWR EDI | Supplied by the sender on the JSON file |
| --- | --- |
| `header.senderIdentifier`, `senderName`, `creationDate`, `creationTime`, `version`, `softwarePackage` (from `HDR`) | `header.conventions` |
| Everything under `works[]` except the items in the right column | `header.tags`, `works[].messages.tags`, `recordings[].tags`, `recordings[].releases[].tags` |
| | `messages.schema`, `messages.schemaDescription` (set by the converter on every work) |

### `header.conventions`

Optional. When present, both fields are required. Not mapped from CWR EDI; the sender sets it on the JSON file.

Omit `conventions` when the file mixes representations, for example when some works list a writer as both `SWR` and `OWR` and others do not. A file without `conventions` makes no claim about how writers and publisher shares are represented; the recipient reads each work as it is.

| Field             | Values                              | Meaning                                                                                          |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `writerControl`   | `swrOnly`, `swrOwr`                 | `swrOnly`: writer is SWR only, with publisher relationships on that writer. `swrOwr`: the same writer may also appear as OWR. |
| `publisherShare`  | `summed`, `perWriterChain`          | `summed`: one publisher share can cover several writers. `perWriterChain`: one publisher share per writer chain. |

```json
"header": {
  "conventions": {
    "writerControl": "swrOnly",
    "publisherShare": "perWriterChain"
  }
}
```

### `header.tags`

Optional. Not mapped from the CWR `HDR` record. The sender sets them on the JSON file. Each tag is a `name` plus a `value` string array with at least one string. Parties who agree on a name can carry extra fields without a format change. A file-level example:

```json
"header": {
  "tags": [{ "name": "custom", "value": ["example"] }]
}
```

### Example

`header` for the CWR 2.2 `HDR` of `BC-key008.V22` (see [Examples](/docs/examples)):

```json
"header": {
  "senderIdentifier": "PB000000TST",
  "senderName": "CWR-JSON TEST FIXTURE",
  "creationDate": "20260101",
  "creationTime": "120000",
  "version": "2.2",
  "softwarePackage": "CWR-JSON PLAYGROUND"
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
| L    | string    | Lookup value. Valid values from a code table — see [Role Codes & related tables](/docs/role-codes-rights-title-types). |

### Optional fields

Optional fields (Req = **O**) **must be omitted** from the JSON object if they have no value — do not include them as `null`.

```jsonc
// ✅ Correct — omit optional fields with no value
{ "senderIdentifier": "EMI", "creationDate": "20260101" }

// ❌ Wrong — do not include null optional fields
{ "senderIdentifier": "EMI", "creationDate": "20260101", "characterSet": null }
```

<br />
