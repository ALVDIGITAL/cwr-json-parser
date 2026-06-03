---
title: TIS Territory Codes
slug: tis-territory-codes
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: CISAC TIS numeric codes used in territory include/exclude and the published lookup table.
---

Territory codes follow the **CISAC Territory Information System (TIS)**. They appear in:

- `parties[].territories[].territory.include[]` / `exclude[]` (collection scope)
- `parties[].relinquishment.scope.territories` (PWR relinquishment)

**Ownership (`shareTypes[].type: "own"`)** must use empty `include` and `exclude` arrays — not TIS-scoped. See [Territories & Shares](./interested-parties/territories-shares).

---

## Published lookup (validation 1.1.0)

The machine-readable lookup table is published at:

**[cwr_lookup_data_types_v1.0_r0.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json)**

| Field | Value |
|---|---|
| Source | CISAC TIS database export — 241 territories (Validation 1.1.1) |
| Set key | `sets.tisNumericCodes` |
| Schema | Enums injected into [cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) |

Example — check whether a code is in the published set:

```js
const lookupUrl =
  'https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json';

const { sets } = await fetch(lookupUrl).then((r) => r.json());
const tisCodes = new Set(sets.tisNumericCodes);

console.log(tisCodes.size);
console.log(tisCodes.has('2136')); // World
```

Official CISAC publications remain authoritative for disputes; see [cisac.org](https://www.cisac.org).

---

## Common codes

| TIS | Name |
|---|---|
| `2136` | World |
| `2120` | Europe |
| `2129` | North America |
| `840` | United States |
| `826` | United Kingdom |
| `276` | Germany |
| `036` | Australia |

Full list: download the [lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) and read `sets.tisNumericCodes`.
