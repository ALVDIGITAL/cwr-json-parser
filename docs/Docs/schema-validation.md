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


## JSON Schema file (v1.0)

| File | Purpose |
|---|---|
| `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json` | Validates `SchemaV1Output` shape (draft-07) |
| `src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json` | Allowed value sets (role codes, TIS, title types, …) |

Regenerate after lookup or overlay changes:

```bash
npm run lookup:build      # refresh TIS + lookup JSON from ISO 3166 + CISAC groups
npm run schema:generate   # inject enums/patterns into the schema
npm run schema:check      # regenerate + fail on git drift
```

Types: `src/cwr-sdk/types/cwr.ts`. The Playground registry exposes only **`schemaV1`** (`src/cwr-sdk/mapper/schemaRegistry.ts`).

> **Validation 1.1.0** tightens the existing `cwr-json-v1-0` schema (same schema id). Hand-edited JSON that passed before may fail strict validation; use `advisory` mode during migration.

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
| `tisNumericCodes` | territory `include` / `exclude`, relinquishment scope |

Export: `@alvdigital/cwr-json-parser/schema` → `getLookupDataTypes()`, `hasTisCode()`, etc.

See also [TIS Territory Codes](./tis-territory-codes).

---

## What to validate

| Layer | Use when |
|--------|----------|
| **`schemaV1.convert(parsed)`** | Matches Playground download / tree (includes `messages.schema`, `messages.schemaDescription`) |
| **`ParsedCwrFile` (canonical)** | Internal or custom tooling; schema metadata optional |

**Package API** (JSON Schema + semantic rules):

```js
import { validateCwrJson, validateParsedCwr } from '@alvdigital/cwr-json-parser';

const result = validateParsedCwr(playgroundJson);       // strict (default)
const warn = validateCwrJson(playgroundJson, 'advisory'); // errors listed, valid: true

// result.warnings — auto-fixes applied (ISWC format, territory split, sub-pub own removal)
// Disable fixes: validateCwrJson(data, 'strict', 'cwr-json-v1-0', { normalize: false })
```

---

## Declaring the schema in your file

For file exchange, add a `$schema` property at the root (optional for Playground output today):

```json
{
  "$schema": "https://[host]/schemas/cwr-json-schema-v1.0.schema.json",
  "header": { ... },
  "works": [ ... ]
}
```

Recipients can use this URL to retrieve the schema version used for validation.

---

## Validating locally

**Node.js (package)**

```js
import { validateCwrJson } from '@alvdigital/cwr-json-parser';

const result = validateCwrJson(data);
if (!result.valid) console.error(result.errors);
```

**Node.js (ajv only)**

```js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

const schema = JSON.parse(
  readFileSync('src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json', 'utf8')
);
const data = JSON.parse(readFileSync('my-file.json', 'utf8'));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.error(validate.errors);
else console.log('Valid ✓');
```

Note: ajv-only validation does not run semantic rules (territory overlap, sub-publisher `own`, duplicate submitter work numbers). Use `validateCwrJson` for the full check.

---

## Structural vs semantic validation

**JSON Schema (structural + lookups)** — enforced by `validateCwrJson` via AJV:

- Required fields, types, closed objects
- Lookup enums: role codes, TIS codes, title types, identifier sources, message types, AI indicators
- Patterns: dates (`YYYYMMDD`), times (`HHMMSS`), IPI (11 digits), ISWC, ISRC, EAN
- Share percentages `0`–`100`
- **Conditional:** `own` territories must have empty TIS `include` / `exclude`

**Semantic pass** — same API, after AJV:

| Rule ID | Rule |
|---|---|
| `TIS_OVERLAP` | Same code not in both `include` and `exclude` on one entry |
| `OWN_EMPTY_TIS` | Redundant check for `own` + non-empty TIS |
| `SUBPUB_NO_OWN` | `SE`, `AM`, `PA` must not have `own` |
| `PUB_OWN_E_ONLY` | Non-`E` publishers must not have `own` |
| `ID_UNIQUE_SUBMITTER` | `submitterWorkNumber` unique per file |
| `TIS_UNKNOWN` | Unknown TIS (when not caught by schema enum) |

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
