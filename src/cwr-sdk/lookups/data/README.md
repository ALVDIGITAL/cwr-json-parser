# Lookup source data

| File | Purpose |
|------|---------|
| `CISAC-TIS.xlsx` | Official CISAC TIS database export (sheet `en`, column `TIS-N`). Primary source for `tisNumericCodes`. |
| `iso3166-slim-2.json` | Fallback only when `CISAC-TIS.xlsx` is missing (dev fetch). |

Refresh after updating the xlsx from CISAC (ISTIS-0184):

```bash
# copy your export, then:
npm run lookup:build
# or point at Downloads:
npx tsx scripts/build-lookup-data.ts "C:/Users/.../TIS.xlsx"
npm run schema:generate
```
