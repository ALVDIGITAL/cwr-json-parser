---
title: TIS Territory Codes
slug: tis-territory-codes
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: CISAC TIS numeric codes used in territory include/exclude and the bundled lookup table.
---

Territory codes follow the **CISAC Territory Information System (TIS)**. They appear in:

- `parties[].territories[].territory.include[]` / `exclude[]` (collection scope)
- `parties[].relinquishment.scope.territories` (PWR relinquishment)

**Ownership (`shareTypes[].type: "own"`)** must use empty `include` and `exclude` arrays — not TIS-scoped. See [Territories & Shares](./interested-parties/territories-shares).

---

## Bundled lookup (validation 1.1.0)

The reference implementation ships a machine-readable table:

`src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json`

| Field | Value |
|---|---|
| Source | CISAC TIS database export (`src/cwr-sdk/lookups/data/CISAC-TIS.xlsx`, sheet `en`, column `TIS-N`) — 237 territories |
| Set key | `sets.tisNumericCodes` |
| Refresh | Replace `CISAC-TIS.xlsx`, then `npm run lookup:build` or `npx tsx scripts/import-tis.ts [path-to.xlsx]` |

Access from npm:

```js
import { getLookupDataTypes, hasTisCode } from '@alvdigital/cwr-json-parser/schema';

const { sets } = getLookupDataTypes();
console.log(sets.tisNumericCodes.length);
hasTisCode('2136'); // World
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

Full list: use `getLookupSet('tisNumericCodes')` from the package or open the JSON file above.
