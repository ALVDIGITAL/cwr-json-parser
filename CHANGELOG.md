## [1.4.2] - 2026-06-22

### Fixed

- **Collection territory merge:** zero-share `SPT`/`SWT` records (exclude-only scope) now merge `include`/`exclude` TIS into the active collection territory instead of creating a separate node with `value: 0` shares.
- **Zero shares omitted:** collection and ownership share arrays no longer emit entries with `value: 0` (matches schema docs).
- **Duplicate sub-publisher nodes:** repeated `SPU` for the same `partyId` under the same original publisher (`E`) chain is deduplicated; same sub-publisher under different `E` parents is unchanged.

### Added

- Tests: `territoryUtils` unit cases (KEY015, KEY005D, MOD017 patterns) and fixture integration tests (`BC-key015`, `BC-key008`, `BC-key044`).

### Notes

- **CWR-JSON v1.00 r0 format unchanged** — parser output shape is the same; territory rows are consolidated and zero-value shares are omitted.

## [1.4.1] - 2026-06-17

### Fixed

- `normalizeCwrJson` strips blank (`""`) and `000` collecting-society codes on shares; emits normalization warnings.
- Parser omits non-present society via `presentSocietyCode` — CWR blank/000 → no `society` field in output.

### Notes

- **CWR-JSON v1.00 r0 format unchanged** — optional normalization only.

## [1.4.0] - 2026-06-15

### Added

- EDI-level validation on raw CWR text:
  - `validateCwrFilename` — `CWyynnnnsss_rrr.Vxx` naming convention
  - `validateCwrRecordOrder` — work-block record order (`scope: 'first' | 'all'`)
  - `validateCwrSequence` — `TransactionSeq` / `RecordSeq` numbering
  - `validateCwrEdi` — combined filename + order + sequence checks
- Lookup table revision **r1** (`cwr_lookup_data_types_v1.0.json`): CISAC-derived `societyCodes` (300+), `characterSets`, `languageCodes`, `revocationReasons`, `anomalousWorkReasons` injected into JSON Schema enums.
- `hasSocietyCode` + `societyCodeVariants` on `@alvdigital/cwr-json-parser/schema` (padded/unpadded numeric forms).

### Changed

- Bundled lookup metadata: `revision: r1`, `generatedAt: 2026-06-14`, `cisacGeneratedAt: 2026-06-15`.

### Notes

- **CWR-JSON v1.00 r0 output shape unchanged**.
- Stricter validation may reject hand-edited JSON with invalid society, `header.characterSet`, revocation, or anomalous-work reason values.

## [1.3.1] - 2026-06-03

### Added

- Optional **normalization** before validation: ISWC display format, split `own`/`coll` territories, remove invalid `own` on sub-publishers (`SE`/`AM`/`PA`).
- Validation **warnings** for auto-fixes applied during normalization.
- Readable validation errors with rule codes (`ISWC_FORMAT`, `OWN_COLL_MIXED`, `TIS_OVERLAP`, …) and deduplicated schema messages.
- TIS lookup rebuilt from official CISAC export (241 territories).

### Notes

- Normalization operates on a copy; the original payload is not mutated.
- **CWR-JSON v1.00 r0 format unchanged** — normalization is optional pre-validation cleanup, not a format bump.

## Validation 1.1.0 — 2026-06-03

### Added

- Published [lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) (`cwr_lookup_data_types_v1.0_r0.json`): 565+ TIS codes, role/title/identifier enums.
- Semantic validation rules: territory overlap, sub-publisher no `own`, E-only publisher `own`, duplicate `submitterWorkNumber`.

### Changed

- [JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) enforces lookup enums, date/ISWC/IPI/ISRC patterns, share bounds, and `own` + empty TIS via conditional rules.
- **Strict** validation runs semantic rules after JSON Schema; **advisory** mode still returns success with all errors listed.
- Closed role code set includes `CA`.

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

