---
title: Schema Validation
slug: schema-validation
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: How to validate CWR-JSON files using the published JSON Schema and lookup tables.
---


## Published assets (v1.0)

| Asset | URL |
|---|---|
| JSON Schema | [cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) — validates the CWR-JSON v1.0 output shape (draft-07) |
| Lookup table | [cwr_lookup_data_types_v1.0.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0.json) — allowed value sets (role codes, TIS, title types, …) |

The schema embeds lookup enums and field patterns derived from the lookup table. CISAC CWR 2.x lookup tables (`CWR08-3615R2`) are the source for most enum sets; TIS codes come from the CISAC TIS export. Regenerate locally with `npm run schema:generate`.

---

## Lookup data types

| Set | Used on |
|---|---|
| `roleCodes` | `parties[].role` |
| `rightsTypes` | `shares[].rightsType` |
| `shareTypes` | `shareTypes[].type` (`own`, `coll`) |
| `controlled` | `parties[].controlled` |
| `titleTypes` | `titles[].type` |
| `identifierSources` | `identifiers[].source` |
| `messageTypes` | `messages.type` |
| `aiUsageIndicators` | `flags.aiUsage` |
| `characterSets` | `header.characterSet` |
| `societyCodes` | `shares[].society` |
| `languageCodes` | `titles[].language` |
| `revocationReasons` | `messages.revocation.reason` |
| `anomalousWorkReasons` | `flags.anomalousReason` |
| `tisNumericCodes` | territory `include` / `exclude`, relinquishment scope |

Additional CISAC reference sets (instruments, work types, transaction types, etc.) are bundled in the lookup JSON for tooling but are not yet enforced on JSON output fields until the parser exposes those properties.

See also [TIS Territory Codes](./tis-territory-codes).

---

## What to validate

| Layer | Use when |
|--------|----------|
| **Playground / download JSON** | Full v1.0 envelope including `messages.schema` and `messages.schemaDescription` on each work |
| **Canonical work data** | Internal or custom tooling; schema metadata optional |

Validate against the [published JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json). For a complete check, also apply the semantic rules listed below — JSON Schema alone does not cover all business rules.

---

## Declaring the schema in your file

For file exchange, add a `$schema` property at the root (optional for Playground output today):

```json
{
  "$schema": "https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json",
  "header": { ... },
  "works": [ ... ]
}
```

Recipients can use this URL to retrieve the schema version used for validation.

---

## Validating with AJV (Node.js)

```js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

const schemaUrl =
  'https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json';

const schema = await fetch(schemaUrl).then((r) => r.json());
const data = JSON.parse(readFileSync('my-file.json', 'utf8'));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.error(validate.errors);
else console.log('Valid ✓');
```

Note: AJV-only validation does not run semantic rules (territory overlap, sub-publisher `own`, duplicate submitter work numbers). Apply the semantic pass separately or use a validator that implements the full rule set (see [Changelog](./overview/changelog)).

---

## Structural vs semantic validation

**JSON Schema (structural + lookups)** — enforced via AJV against the published schema:

- Required fields, types, closed objects
- Lookup enums: role codes, TIS codes, title types, identifier sources, message types, AI indicators, character sets, society codes, language codes, revocation/anomalous reasons
- Patterns: dates (`YYYYMMDD`), times (`HHMMSS`), IPI (11 digits), ISWC, ISRC, EAN
- Share percentages `0`–`100`
- **Conditional:** `own` territories must have empty TIS `include` / `exclude`

**Semantic pass** — after JSON Schema, in strict mode:

| Rule ID | Rule |
|---|---|
| `TIS_OVERLAP` | Same code not in both `include` and `exclude` on one entry |
| `OWN_EMPTY_TIS` | Redundant check for `own` + non-empty TIS |
| `SUBPUB_NO_OWN` | `SE`, `AM`, `PA` must not have `own` |
| `PUB_OWN_E_ONLY` | Non-`E` publishers must not have `own` |
| `ID_UNIQUE_SUBMITTER` | `submitterWorkNumber` unique per file |
| `TIS_UNKNOWN` | Unknown TIS (when not caught by schema enum) |

**Optional normalization (Validation 1.1.1)** — before validation:

- Compact ISWC → `T-NNNNNNNNN-C`
- Split combined `own`/`coll` territory rows
- Strip invalid `own` on sub-publishers

**Still application-level** (not implemented):

| Rule | Example |
|---|---|
| Share totals | PR + MR + SR consistency across parties |

---

## Schema versioning

Published schema filenames are expected to encode version and revision:

```
cwr-json-schema-v{MAJOR}.{MINOR}.schema.json
```

SPF interchange naming:

```
cwr_schema_v1.0_r0.json
cwr_lookup_data_types_v1.0_r0.json
```

No more than **two versions** should be in active circulation at any time. When a new version is released, the oldest active version is deprecated (but may remain on the server for backward compatibility).
