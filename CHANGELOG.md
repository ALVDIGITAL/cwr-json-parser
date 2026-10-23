## [Unreleased]

## [1.5.3] - 2026-10-23

### Added

- Optional `tags` on `header` and `works[].messages`: `{ name, value: string[] }`. Same shape as recording and release tags. Not mapped from CWR EDI.

### Notes

- **CWR-JSON format 1.0.1.** Schema filename stays `cwr-json-schema-v1.0.schema.json`.

## [1.5.2] - 2026-10-19

### Changed

- **ISWC** is no longer `works[].iswc`. One `identifiers[]` entry is `{ iswc: string[] }`. It is not a `{ type, value, source }` triple. `NWR` / `REV` `ISWC` and `XRF` org `ISW` with `IdentifierType` `W` append to that array.
- **`works[].isrc` is removed.** `XRF.IdentifierType` chooses the node.
  - `W`: org code still picks the work id (`ISW`, society, 2–3 letter publisher, or `proprietary`).
  - `R`: a valid ISRC stays on `recordings[].isrc` when it already matches. Each unmatched code is its own recording, `{ isrc: [code] }`.
  - `P`: a 13-digit EAN is its own recording, `{ releases: [{ ean: [code] }] }`. It is not attached to other recordings.
  - `V`: not mapped.
- A later `REC` with the same ISRC fills the empty title and version on that shell.

### Notes

- **CWR-JSON format 1.0.1.** Schema filename stays `cwr-json-schema-v1.0.schema.json`.
- Supersedes the `works[].iswc` and `works[].isrc` placement in parser `1.5.1`.

## [1.5.1] - 2026-10-19

### Added

- **`header.conventions`:** optional file-level declaration of writer and publisher representation. `writerControl` is `swrOnly` or `swrOwr`. `publisherShare` is `summed` or `perWriterChain`. Both fields are required when the object is present. Not mapped from the CWR `HDR` record.
- **Format 1.0.1 identifiers:** `works[].iswc`, `works[].isrc`, `recordings[].isrc`, and `recordings[].releases[].ean` are string arrays. ISWC, ISRC, and EAN leave `identifiers[]`.
- **Identifier triple:** `identifiers[]` is `{ type, value, source? }`. `source.type` is `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid`.
- **Tags:** optional on recordings and releases, `{ name, value: string[] }`. Not mapped from CWR EDI.

### Changed

- `NWR.SubmitterWorkNumber` maps to `submitterWorkId` with `source.type` `cwrSubmitter` from the `HDR` sender.
- `XRF` numeric society codes map to `societyWorkId` / `cisacSociety`. `XRF` 2–3 letter codes map to `publisherWorkId` / `cwrSubmitter`. A missing org is `{ type: "proprietary", value }` with no `source`.
- An `XRF` `ISR` that matches a recording ISRC is not copied. One that matches no recording stays on `works[].isrc`.
- Release catalog number stays on `catno` only.
- Schema accepts dotted `T-NNN.NNN.NNN-C`, compact `TNNNNNNNNNC`, and intermediate `T-NNNNNNNNN-C`. Parser output emits dotted ISO only.

### Notes

- **CWR-JSON format 1.0.1.** Schema filename stays `cwr-json-schema-v1.0.schema.json`.
- `header.conventions` is additive. Files without it stay valid. A validator built before that field rejects it as an extra header field.
- Identifier field shapes changed. JSON that still uses `{ source, value }`, or string `iswc` / `isrc` / `ean`, fails validation.

## [1.5.0] - 2026-07-26

### Added

- **ACK / MSG:** fixed-width layouts in `recordDefinitions` for field-level EDI preview.
- GRH `TransactionType=ACK` starts a work block on each `ACK` row. Nested `NWR`/`REV` stay in that block.
- Flat ACK fields on `works[].messages` (`type: "ack"`, `transactionStatus`, dates, creation numbers).
- `MSG` maps to `messages.msgs[]` with `status`, `message`, `originalRecordSequence`, `recordType`, `messageLevel`, and `validationNumber`.
- Sample fixture: `test/files/151708_CW260050035_MDW.V22`.

### Fixed

- Nested `NWR` after `ACK` no longer overwrites `messages.type`.

### Notes

- **Additive.** Existing `nwr`/`rev` shapes unchanged. `MessageType` includes `"ack"`. `msgs[]` allows the extra MSG columns.

## [1.4.3] - 2026-06-30

### Added

- **XRF → `identifiers[]`:** CWR 2.2 Work ID Cross Reference records map into `works[].identifiers` — `OrganisationCode` → `source`, `Identifier` → `value`; `ISW` → `iswc`, `ISR` → `isrc`; society and submitter org codes (e.g. `035`, `EMI`) as `source`; skip org `000`/`099`; dedupe on `{source, value}`.
- **Schema / lookup:** `identifierSources` includes CISAC society codes and `isrc`; `identifiers[].source` also accepts 2–3 letter CWR submitter IDs; conditional ISRC pattern on work identifiers.
- Sample fixture: `test/files/XRF-identifiers-sample.V22`.

### Notes

- **CWR-JSON v1.00 r0 field shapes unchanged** — new data in existing `identifiers[]`; stricter validation may apply to hand-edited JSON with society-code `source` values.

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

