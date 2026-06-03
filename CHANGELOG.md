## [1.3.0] - 2026-06-03

### Added

- **Validation Update** (same `cwr-json-v1-0` schema id): lookup table `cwr_lookup_data_types_v1.0_r0.json` (565+ TIS codes, role/title/identifier enums).
- Semantic validation pass: territory overlap, sub-publisher no `own`, E-only publisher `own`, duplicate `submitterWorkNumber`.
- Scripts: `npm run lookup:build`, `schema:generate`, `schema:check`.
- `@alvdigital/cwr-json-parser/schema` exports `getLookupDataTypes()`, `hasTisCode()`, role helpers.

### Changed

- `cwr-json-schema-v1.0.schema.json` now enforces lookup enums, date/ISWC/IPI/ISRC patterns, share bounds, and `own` + empty TIS via `if`/`then`.
- `validateCwrJson` / `validateParsedCwr` run semantic rules in **strict** mode; **advisory** still returns `valid: true` with all errors listed.
- `RoleCode` type includes `CA`; extension `| string` removed for closed role set.

### Notes

- **CWR-JSON v1.00 r0 output shape unchanged** — stricter validation may reject previously accepted hand-edited JSON.
- Refresh TIS data: `npx tsx scripts/import-tis.ts` (alias for lookup build).

## [1.2.0] - 2026-06-03

### Added

- Dual ESM + CommonJS build (tsup) so Vite/Vue can use named `import` and Lambda can keep `require()`.
- Official subpath exports:
  - `@alvdigital/cwr-json-parser/edi-preview`
  - `@alvdigital/cwr-json-parser/record-parser`
  - `@alvdigital/cwr-json-parser/schema`
- `guides/MIGRATION-VUE.md` for Playground migration from 1.1.x.

### Changed

- Package is `"type": "module"` with `.cjs` for CommonJS.
- Published `src/` so devtools source maps resolve (supported imports remain only via `exports`).
- Node **18+** required (`engines`).

### Notes

- Main API (`parseCwr`, validators) is unchanged.
- **CWR-JSON v1.0 output shape is unchanged** — no format bump for integrators.
- Spec errata (2026-06-03): removed incorrect “CWR 3.x” terminology; relinquishment is **CWR 2.2 Rev3**. Ownership (`own`) is not TIS-scoped; sub-publishers have no `own` rows. See `docs/Docs/overview/changelog.md`.
- See MIGRATION-VUE.md to remove Vite bridges and deep `dist/cwr-sdk` imports.

