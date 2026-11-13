---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    How to validate CWR-JSON files using the published JSON Schema and lookup
    tables.
position: 2
privacy:
  view: public
slug: schema-validation
title: Schema Validation
---
## Published assets (format 1.0.1)

| Asset | File | Notes |
|---|---|---|
| JSON Schema | [cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) | JSON Schema draft-07. Validates format `1.0.1`. The filename keeps `v1.0` for every `1.0.x` format (see [Version governance](/docs/changelog#version-governance)) |
| Lookup table | [cwr_lookup_data_types_v1.0_r0.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) | Allowed value sets (role codes, TIS, title types, …). The file content reports `"revision": "r1"` (CISAC society, character set, language, revocation and anomalous-work sets added in Validation 1.1.2) |

The schema embeds lookup enums and field patterns derived from the lookup table, so you only need the schema file to validate. CISAC CWR 2.x lookup tables (`CWR08-3615R2`, 2026-03-31) are the source for most enum sets; TIS codes come from the CISAC TIS export. Regenerate locally with `npm run schema:generate`.

---

## Lookup data types

| Set | Used on |
|---|---|
| `roleCodes` | `parties[].role` |
| `rightsTypes` | `shares[].rightsType` |
| `shareTypes` | `shareTypes[].type` (`own`, `coll`) |
| `controlled` | `parties[].controlled` |
| `titleTypes` | `titles[].type` |
| `identifierSources` | Not used by format `1.0.1` validation. Kept in the lookup file for older tooling. Format `1.0.1` validates `identifiers[].type` and `identifiers[].source.type` with closed enums in the schema (see below) |
| `messageTypes` | `messages.type` |
| `aiUsageIndicators` | `flags.aiUsage` |
| `characterSets` | `header.characterSet` |
| `societyCodes` | `shares[].society` |
| `languageCodes` | `titles[].language` |
| `revocationReasons` | `messages.revocation.reason` |
| `anomalousWorkReasons` | `flags.anomalousReason` |
| `tisNumericCodes` | territory `include` / `exclude`, relinquishment scope |

`aiUsageIndicators` contains the CISAC values `M`, `T`, `A` plus `B`, `N`, `U`, `Y`. Senders should use only `M`, `T` or `A`; the extra values are under review.

`header.conventions` is not a lookup set. When the object is present, `writerControl` must be `swrOnly` or `swrOwr`, and `publisherShare` must be `summed` or `perWriterChain`.

Additional CISAC reference sets (instruments, work types, transaction types, etc.) are bundled in the lookup JSON for tooling but are not yet enforced on JSON output fields until the parser exposes those properties.

See also [TIS Territory Codes](/docs/tis-territory-codes).

---

## Identifiers

`works[].identifiers[]` items must match exactly one of two shapes (`oneOf`):

**ISWC entry** (`IswcIdentifier`): one object with an `iswc` string array (`minItems` 1) and no other properties.

```json
{ "iswc": ["T-034.524.680-1"] }
```

Each ISWC must be dotted `T-NNN.NNN.NNN-C`, compact `TNNNNNNNNNC`, or intermediate `T-NNNNNNNNN-C`. Parser output always uses the dotted form.

**Namespaced entry** (`WorkIdentifier`): `type` and `value` are required; `source` is optional. No other properties are allowed.

| Field | Rule |
|---|---|
| `type` | `publisherWorkId`, `societyWorkId`, `submitterWorkId`, `assetId`, or `proprietary` |
| `value` | string |
| `source` | object, optional. Required properties `type` and `value`; optional `name` |
| `source.type` | `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid` |

```json
{
  "type": "submitterWorkId",
  "value": "SW00000000001",
  "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "XRF SAMPLE PUBLISHER" }
}
```

`identifiers[].source` is an object. The older string form (`"source": "iswc"`) is not valid in format `1.0.1`.

ISRC and EAN are not identifier entries. They are string arrays on `recordings[].isrc` (pattern `^[A-Z]{2}[A-Z0-9]{3}\d{7}$`) and `recordings[].releases[].ean` (13 digits). Recordings and releases may carry their own `identifiers[]` with the `WorkIdentifier` shape.

---

## What to validate

| Layer | Use when |
|--------|----------|
| **Playground / download JSON** | Full v1.0 envelope including `messages.schema` and `messages.schemaDescription` on each work |
| **Canonical work data** | Internal or custom tooling; schema metadata optional |

Validate against the [published JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json). For a complete check, also apply the semantic rules listed below — JSON Schema alone does not cover all business rules.

---

## Declaring the schema version

Do **not** put a `$schema` property in the file. The format `1.0.1` schema sets `additionalProperties: false` on the root object, so a file with a root `$schema` fails validation:

```
/ [EXTRA_PROPERTY]: unexpected property "$schema"
```

Agree the schema version out of band (for example in the API contract or file exchange agreement). Allowing a root `$schema` would be a schema change and is an open item for the CWR-JSON subgroup.

---

## Validating with AJV (Node.js 18+)

```js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

const schemaUrl =
  'https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json';

const schema = await fetch(schemaUrl).then((r) => r.json());
const data = JSON.parse(readFileSync('my-file.json', 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.error(validate.errors);
else console.log('Valid');
```

Install with `npm install ajv ajv-formats`. Save the snippet as an `.mjs` file (top-level `await`). `strict: false` stops Ajv 8 from printing `strictTypes` warnings for the conditional territory rules; validation results are the same either way.

AJV-only validation does not run the semantic rules below (territory overlap, sub-publisher `own`, duplicate submitter work ids). Apply the semantic pass separately or use a validator that implements the full rule set.

---

## Structural vs semantic validation

**JSON Schema (structural + lookups)** — enforced via AJV against the published schema:

- Required fields, types, closed objects (`additionalProperties: false` on the root, `header`, works, identifiers, shares, recordings, releases)
- Required on every work: `messages`, with `messages.schema` and `messages.schemaDescription`
- Lookup enums: role codes, TIS codes, title types, message types, AI indicators, character sets, society codes, language codes, revocation/anomalous reasons
- `identifiers[]` items: `oneOf` the ISWC entry or the namespaced entry (see [Identifiers](#identifiers))
- Patterns: dates (`YYYYMMDD`), times (`HHMMSS`), IPI (11 digits), ISWC, ISRC, EAN
- Optional `header.conventions`: both `writerControl` and `publisherShare` required when present
- Optional `tags` on `header`, `works[].messages`, recordings, and releases: `name` plus `value` string array (`minItems` 1). Not mapped from CWR EDI.
- Share percentages `0`–`100`
- **Conditional:** `own` territories must have empty TIS `include` / `exclude`

**Semantic pass** — after JSON Schema, in strict mode:

| Rule ID | Rule |
|---|---|
| `TIS_OVERLAP` | Same code not in both `include` and `exclude` on one entry |
| `OWN_EMPTY_TIS` | Redundant check for `own` + non-empty TIS |
| `SUBPUB_NO_OWN` | `SE`, `AM`, `PA` must not have `own` |
| `PUB_OWN_E_ONLY` | Non-`E` publishers must not have `own` |
| `ID_UNIQUE_SUBMITTER` | Across all `works[]` in one file, no two works may have a `works[].identifiers[]` entry with `type: "submitterWorkId"` and the same `value`. Only `value` is compared (`source` is ignored). The error text says "duplicate submitterWorkNumber", the CWR EDI field name |
| `TIS_UNKNOWN` | Unknown TIS (when not caught by schema enum) |

**Optional normalization (Validation 1.1.1)** — before validation:

- Recognized ISWC → dotted `T-NNN.NNN.NNN-C`
- Split combined `own`/`coll` territory rows
- Strip invalid `own` on sub-publishers
- Strip empty and `000` society codes on shares

**Still application-level** (not implemented):

| Rule | Example |
|---|---|
| Share totals | PR + MR + SR consistency across parties |

---

## Schema versioning

Which level changes, and when, is in [Version governance](/docs/changelog#version-governance). Those rules apply to every release after format `1.0.1`.

Published file names:

```
cwr-json-schema-v{MAJOR}.{MINOR}.schema.json
cwr_lookup_data_types_v{MAJOR}.{MINOR}_r{N}.json
```

Format `1.0.1` uses `cwr-json-schema-v1.0.schema.json` and `cwr_lookup_data_types_v1.0_r0.json`.

No more than **two versions** should be in active circulation at any time. When a new version is released, the oldest active version is deprecated (but may remain on the server for backward compatibility).
