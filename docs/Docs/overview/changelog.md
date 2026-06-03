---
title: Changelog
slug: changelog
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: Version history for CWR-JSON.
---

## Schema stability (read first)

**CWR-JSON format version `1.00` / revision `0` remains the current interchange schema.** Field names, object shapes, and JSON Schema (`cwr-json-schema-v1.0.schema.json`) are frozen unless this changelog records an explicit **format** bump.

| Change type | Affects your integration? |
|---|---|
| **Format** (new `works[]` fields, renamed properties, new required fields) | **Yes** — plan migration; we will announce here in advance |
| **Documentation** (terminology, pipeline description, examples) | **No** — same JSON output |
| **Reference implementation** (`@alvdigital/cwr-json-parser` npm releases, Playground UI) | **Usually no** — see release notes; parser output shape unchanged unless a format row appears above |

Integrators (including downstream export pipelines) should treat this page and the repository `CHANGELOG.md` as the source of truth. Subscribe to repository releases or contact the SPF committee for advance notice of any planned format revision.

---

## 2026-06-03 — Validation UX & normalization (@1.3.1, no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.** Validation ergonomics and optional pre-validation cleanup.

**@alvdigital/cwr-json-parser@1.3.1**
- **`normalizeCwrJson()`** applied by default before `validateCwrJson`: compact ISWC → `T-NNNNNNNNN-C`, split combined `own`/`coll` territory rows, strip invalid `own` on sub-publishers.
- **`result.warnings`** reports what was auto-fixed; **`{ normalize: false }`** skips cleanup for strict checks on raw exports.
- Clearer **`result.errors`**: rule codes and deduplicated messages instead of repeated `[if]` / `[maxItems]` noise.
- TIS lookup sourced from bundled **CISAC TIS.xlsx** export (see [TIS Territory Codes](../tis-territory-codes)).

---

## 2026-06-03 — Validation 1.1.0 (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.** Stricter `validateCwrJson` / JSON Schema only.

**Validation 1.1.0** (`@alvdigital/cwr-json-parser@1.3.0`)
- Bundled `cwr_lookup_data_types_v1.0_r0.json`: role codes, title types, identifier sources, full TIS table (CISAC groups + ISO 3166-1 numeric).
- JSON Schema (`cwr-json-schema-v1.0.schema.json`) injects enums and patterns via `npm run schema:generate`.
- Semantic rules in strict mode: TIS include/exclude overlap, sub-publisher no `own`, publisher `own` only for `E`, unique `submitterWorkNumber` per file.
- `advisory` validation mode unchanged (warnings without failing).
- See [Schema Validation](../schema-validation) and [TIS Territory Codes](../tis-territory-codes).

---

## 2026-06-03 — Documentation & npm package (no format bump)

> **No change to CWR-JSON v1.0 output.** Errata and reference-implementation packaging only.

**Documentation errata**
- Removed incorrect **“CWR 3.x”** wording throughout the spec. There is no separate CWR 3.x EDI format; features such as publisher **relinquishment** come from **CWR 2.2 Revision 3** (`PWR` records).
- Pipeline description aligned with the reference implementation: `buildWorkModel` → `projectCanonicalFromModel` → `schemaV1.convert()` (see [Introduction](./introduction#the-pipeline)).
- [Schema Validation](../schema-validation) updated: `schema:generate` / `schema:check`, and when to validate `SchemaV1Output` vs canonical `ParsedCwrFile`.

**Ownership vs collection territory placement** (reference implementation; see [Territories & Shares](../interested-parties/territories-shares))
- **`shareTypes[].type: "own"`** (from `SWR` / `OWR` / `SPU` / `OPU`) is **not** scoped to TIS codes. It is stored in a `territories[]` entry with `territory.include: []` and `territory.exclude: []` (`upsertOwnTerritory` in `territoryUtils.ts`).
- **`shareTypes[].type: "coll"`** (from `SWT` / `OWT` / `SPT` / `OPT`) **is** scoped to TIS include/exclude on the same or separate `territories[]` entries.
- **Sub-publishers** (`SE`, `AM`, `PA`) do **not** receive ownership shares in JSON — only **original publishers** (`E`) emit `own` (`isPublisherOwnEligible` in `parseHelpers.ts`). Sub-publishers may have `coll` territories only.
- Integrators must not assume `own` and `coll` share the same `territory.include` array, or that sub-publishers mirror `SPU` ownership percentages.

**Reference implementation (`@alvdigital/cwr-json-parser@1.2.0`)**
- Dual **ESM + CommonJS** build; official subpath exports: `/edi-preview`, `/record-parser`, `/schema`.
- Node **18+** required.
- Playground/Vite migration notes: `docs/MIGRATION-VUE.md` in the GitHub repository (deep `dist/cwr-sdk` imports are not a supported public API).

---

## v1.00 r0 — Initial Release *(current format)*

> First public specification draft aligned with the CWR-JSON Playground reference implementation (`src/cwr-sdk`).

**Architecture**
- Two-phase mapper: `buildWorkModel` → `projectCanonicalFromModel`
- `PublisherRegistry` for publisher chain and PWR resolution
- Territory helpers: `upsertOwnTerritory`, `upsertCollectionTerritory` (`territoryUtils.ts`)

**Format**
- JSON encoding of **CWR 2.x** work-registration records (primary target: **CWR 2.2 Revision 3** EDI)
- JSON Schema: `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json` (draft-07; `npm run schema:generate`)
- Optional root `$schema` for interchange (not emitted by Playground today)

**Supported CWR record types (→ JSON)**
`HDR` `NWR` `REV` `ALT` `NAT` `NWN` `NOW` `NPN` `SPU` `OPU` `SWR` `OWR` `PWR` `SWT` `OWT` `SPT` `OPT` `REC` `ARI` `MSG`

**Data model**
- `parties`: writers at top level; publishers in `representedBy[]`; unlinked `E` publishers may appear at top level
- `parties[].territories[]`: `shareTypes` `own` / `coll`
- `recordings[]` with ISRC dedupe and `releases[].identifiers` (`ean`, `catalogNumber`)
- GEMA `ARI` (035/GW) → `roleSplitM` / `roleSplitT` on `CA` writers
- `NWN` / `NOW` / `NPN` → `nameDomestic` / `nameScript`
- **CWR 2.2 Rev3** `PWR` relinquishment on publisher participants

**HDR → header (populated fields)**
`senderIdentifier`, `senderName`, `creationDate`, `creationTime`, `version` (CWR EDI version, e.g. `"2.1"`), `softwarePackage`
