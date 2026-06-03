---
title: Schema Validation
slug: schema-validation
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: How to validate CWR-JSON files using the published JSON Schema.
---


## JSON Schema file (v1.0)

| File | Purpose |
|---|---|
| `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json` | Validates `SchemaV1Output` shape (draft-07) |

Generated from TypeScript types in the reference repository:

```bash
npm run schema:generate
npm run schema:check    # regenerate + fail on drift
```

Types: `src/cwr-sdk/types/cwr.ts`. The Playground registry exposes only **`schemaV1`** (`src/cwr-sdk/mapper/schemaRegistry.ts`).

> **SPF target (future):** Hosted `cwr_schema_v1.0_r0.json` + `cwr_lookup_data_types_v1.0_r0.json`. Until then, use the repository file above as canonical v1.0.

---

## What to validate

| Layer | Use when |
|--------|----------|
| **`schemaV1.convert(parsed)`** | Matches Playground download / tree (includes `messages.schema`, `messages.schemaDescription`) |
| **`ParsedCwrFile` (canonical)** | Internal or custom tooling; schema metadata optional |

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

**Node.js (ajv)**

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

**Python (jsonschema)**

```python
import json
from jsonschema import validate, ValidationError

with open('src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json') as f:
    schema = json.load(f)

with open('my-file.json') as f:
    data = json.load(f)

try:
    validate(instance=data, schema=schema)
    print("Valid ✓")
except ValidationError as e:
    print(f"Invalid: {e.message}")
```

---

## Structural vs semantic validation

JSON Schema covers **structural** validation:
- Required fields are present
- Field types are correct (string, number, boolean, array)
- Enum values where defined (e.g. `rightsType`: `pr`, `mr`, `sr`)

It does **not** cover **semantic** validation. These rules must be enforced in application code:

| Rule | Example |
|---|---|
| Share totals | PR + MR + SR ownership shares per party must be internally consistent |
| Territory non-overlap | No TIS code should appear in both `include` and `exclude` for the same territory entry |
| ISWC format | `T-NNNNNNNNN-C` per ISO 15707 |
| IPI format | 11-digit numeric string |
| ISRC format | `CC-XXX-YY-NNNNN` |
| Submitter work number uniqueness | Must be unique per submitter across the file |

---

## Schema versioning

Published schema filenames are expected to encode version and revision:

```
cwr-json-schema-v{MAJOR}.{MINOR}.schema.json
```

SPF interchange naming (planned):

```
cwr_schema_v1.0_r0.json
```

No more than **two versions** should be in active circulation at any time. When a new version is released, the oldest active version is deprecated (but may remain on the server for backward compatibility).
