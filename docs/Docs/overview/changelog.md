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

**CWR-JSON format version `1.0.1` is the current interchange schema.** The schema file stays [`cwr-json-schema-v1.0.schema.json`](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json). Further field-shape changes are frozen unless this changelog records an explicit **format** bump.

| Change type | Affects your integration? |
|---|---|
| **Format** (new `works[]` fields, renamed properties, new required fields) | **Yes** — plan migration; we will announce here in advance |
| **Documentation** (terminology, pipeline description, examples) | **No** — same JSON output |
| **Validation** (stricter JSON Schema, lookup tables, semantic rules) | **Maybe** — same field shapes; hand-edited JSON may fail where it previously passed |

Integrators (including downstream export pipelines) should treat this page as the source of truth for format and validation changes. Contact the SPF committee for advance notice of any planned format revision.

---

## 2026-10-23 — Parser 1.5.3 tags on header and messages

> Format `1.0.1`. Schema filename stays `cwr-json-schema-v1.0.schema.json`. Not mapped from CWR EDI. The sender sets the tags on the JSON file.

- Optional `tags` on `header` (file level) and `works[].messages` (work level).
- Each tag is `{ "name": "IC", "value": ["Universal Music Publishing"] }`. `name` is required. `value` is a string array with at least one string.
- Same object already used on recordings and releases.

## 2026-10-19 — Parser 1.5.2 identifier placement

> Format `1.0.1`. Schema filename stays `cwr-json-schema-v1.0.schema.json`. Supersedes the `works[].iswc` and `works[].isrc` placement in parser `1.5.1`.

- ISWC is one `identifiers[]` entry, `{ "iswc": ["T-034.524.680-1"] }`. It is not a `{ type, value, source }` triple. `works[].iswc` is removed.
- `works[].isrc` is removed. `XRF.IdentifierType` chooses the node.
- `W` uses the org code. `ISW` appends to the `iswc` entry. Digits are `societyWorkId` / `cisacSociety`. 2–3 letters are `publisherWorkId` / `cwrSubmitter`. Any other org is `{ "type": "proprietary", "value" }` with no `source`.
- `R` with a valid ISRC stays on `recordings[].isrc` when it already matches. Each unmatched code is its own recording, `{ "isrc": ["..."] }`.
- `P` with a 13-digit EAN is its own recording, `{ "releases": [{ "ean": ["..."] }] }`. It is not attached to other recordings.
- `V` is not mapped.

## 2026-10-19 — Format 1.0.1 identifiers

> Format bump. Schema filename stays `cwr-json-schema-v1.0.schema.json`. Ships in parser package `1.5.1`. Parser `1.5.2` moves ISWC and unmatched ISRC. Parser `1.5.0` is the ACK release below.

- `works[].iswc`, `works[].isrc`, `recordings[].isrc`, and `recordings[].releases[].ean` are string arrays. ISWC, ISRC, and EAN leave `identifiers[]`.
- `identifiers[]` is a triple: `type`, `value`, and optional `source` (`type`, `value`, optional `name`). `source.type` is `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid`.
- `NWR.SubmitterWorkNumber` is `submitterWorkId` with `source.type` `cwrSubmitter` from the `HDR` sender. `XRF` society codes are `societyWorkId` / `cisacSociety`. `XRF` 2–3 letter codes are `publisherWorkId` / `cwrSubmitter`. A missing org is `{ "type": "proprietary", "value" }` with no `source`.
- An `XRF` `ISR` that matches a recording ISRC is not copied again. One that matches no recording is kept on `works[].isrc`.
- Release catalog number stays on `catno` only.
- Schema accepts dotted `T-NNN.NNN.NNN-C`, compact `TNNNNNNNNNC`, and intermediate `T-NNNNNNNNN-C`. Parser output emits dotted ISO only.
- Optional `tags` on recordings and releases: `{ "name": "mood", "value": ["happy", "fun"] }`. Not mapped from CWR EDI.

## 2026-10-14 — Optional `header.conventions`

> Additive optional field on CWR-JSON v1.0. Files without `conventions` stay valid. A validator that has not picked up this schema rejects files that include it. Ships in parser package `1.5.1`.

- `header.conventions` declares how the file represents writers and publisher shares.
- `writerControl`: `swrOnly` or `swrOwr`.
- `publisherShare`: `summed` or `perWriterChain`.
- When `conventions` is present, both fields are required.
- Not mapped from the CWR `HDR` record. The sender sets it on the JSON file.

## 2026-07-26 — Parser 1.5.0 (format additive)

> **Additive only.** Existing `nwr`/`rev` shapes unchanged. `MessageType` gains `"ack"`; optional ACK fields and richer `msgs[]` properties documented.

**Parser 1.5.0**
- `ACK` / `MSG` fixed-width layouts in `recordDefinitions` (field-level EDI preview).
- GRH `TransactionType=ACK` → work blocks start on each `ACK` row (nested `NWR`/`REV` stay in the same block).
- Flat ACK fields on `works[].messages` (`type: "ack"`, `transactionStatus`, dates, creation numbers, …).
- `MSG` → `messages.msgs[]` with `status`, `message`, plus `originalRecordSequence`, `recordType`, `messageLevel`, `validationNumber`.
- Nested `NWR` after ACK no longer overwrites `messages.type`.
- Sample: `test/files/151708_CW260050035_MDW.V22`.

**Validation**
- `MessageType` enum includes `"ack"`.
- `msgs[]` allows the extra MSG columns listed above.

---

## 2026-06-30 — Parser 1.4.3 (no format bump)

> **No change to CWR-JSON v1.00 r0 object shapes.** `works[].identifiers[]` gains rows from `XRF` records; JSON Schema `identifierSources` enum widened.

**Parser 1.4.3**
- **`XRF` (Work ID Cross Reference)** → `works[].identifiers[]`: `OrganisationCode` becomes `source`, `Identifier` becomes `value`.
- Special org codes: `ISW` → `source: "iswc"`; `ISR` → `source: "isrc"`.
- Society codes (e.g. `035`) and CWR submitter IDs (e.g. `EMI`) are valid `source` values; org `000` / `099` rows are skipped.
- Duplicate `{source, value}` pairs are deduplicated (including overlap with `NWR` ISWC).
- Sample file: `test/files/XRF-identifiers-sample.V22`.

**Validation**
- `identifierSources` lookup set merges canonical sources with CISAC society codes and `isrc`.
- `identifiers[].source` accepts the enum **or** `^[A-Z]{2,3}$` for publisher submitter codes.
- ISRC format enforced on `identifiers[]` when `source` is `isrc`.

---

## 2026-06-22 — Parser 1.4.2 (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.** Collection territory mapping and sub-publisher chain deduplication fixes.

**Parser 1.4.2**
- Zero-share `SPT`/`SWT` records merge TIS `include`/`exclude` into the active `coll` territory instead of spawning a separate territory with zero-value shares.
- Share arrays omit `value: 0` entries (aligned with [Territories & Shares](../interested-parties/territories-shares)).
- Duplicate `SPU` for the same sub-publisher under one `E` chain is deduplicated; same `partyId` under different `E` parents remains separate (KEY008, KEY044).
## 2026-06-17 — Society code normalization (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.**

**Validation 1.1.2 (patch)**
- Optional normalization strips empty and `000` society codes on shares before validation.
- Parser output omits blank/`000` society fields (matches CWR EDI semantics).

---

## 2026-06-15 — Validation 1.1.2 (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.**

**Validation 1.1.2**
- Lookup revision **r1**: CISAC society, character set, language, revocation, and anomalous-work enums in published lookup + JSON Schema.
- JSON Schema validates `shares[].society`, `header.characterSet`, `revocation.reason`, `flags.anomalousReason`.
- **EDI validators** on npm package (`validateCwrEdi`, etc.) for raw CWR text before parse — see package [README](https://github.com/ALVDIGITAL/cwr-json-parser#typical-pipeline).

---

## 2026-06-03 — Validation UX & normalization (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.** Validation ergonomics and optional pre-validation cleanup.

**Validation 1.1.1**
- Optional **normalization** before validation: compact ISWC → `T-NNNNNNNNN-C`, split combined `own`/`coll` territory rows, strip invalid `own` on sub-publishers.
- Validation results may include **warnings** for auto-fixed items; strict checks on raw exports can skip normalization.
- Clearer error output: rule codes and deduplicated messages instead of repeated `[if]` / `[maxItems]` noise.
- TIS lookup sourced from **CISAC TIS** export (see [TIS Territory Codes](../tis-territory-codes) and the [published lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json)).

---

## 2026-06-03 — Validation 1.1.0 (no format bump)

> **No change to CWR-JSON v1.00 r0 field shapes.** Stricter JSON Schema and semantic validation only.

**Validation 1.1.0**
- Published [lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) (`cwr_lookup_data_types_v1.0_r0.json`): role codes, title types, identifier sources, full TIS table (CISAC groups + ISO 3166-1 numeric).
- [JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) (`cwr-json-schema-v1.0.schema.json`) injects lookup enums and field patterns.
- Semantic rules in strict mode: TIS include/exclude overlap, sub-publisher no `own`, publisher `own` only for `E`, unique `submitterWorkNumber` per file.
- **Advisory** validation mode unchanged (warnings without failing).
- See [Schema Validation](../schema-validation) and [TIS Territory Codes](../tis-territory-codes).

---

## 2026-06-03 — Documentation errata (no format bump)

> **No change to CWR-JSON v1.0 output.** Specification and validation documentation only.

- Removed incorrect **“CWR 3.x”** wording throughout the spec. There is no separate CWR 3.x EDI format; features such as publisher **relinquishment** come from **CWR 2.2 Revision 3** (`PWR` records).
- Pipeline description aligned with the reference implementation: `buildWorkModel` → `projectCanonicalFromModel` → `schemaV1.convert()` (see [Introduction](./introduction#the-pipeline)).
- [Schema Validation](../schema-validation) updated: published schema and lookup URLs, structural vs semantic validation rules.

**Ownership vs collection territory placement** (see [Territories & Shares](../interested-parties/territories-shares))
- **`shareTypes[].type: "own"`** (from `SWR` / `OWR` / `SPU` / `OPU`) is **not** scoped to TIS codes. It is stored in a `territories[]` entry with `territory.include: []` and `territory.exclude: []`.
- **`shareTypes[].type: "coll"`** (from `SWT` / `OWT` / `SPT` / `OPT`) **is** scoped to TIS include/exclude on the same or separate `territories[]` entries.
- **Sub-publishers** (`SE`, `AM`, `PA`) do **not** receive ownership shares in JSON — only **original publishers** (`E`) emit `own`. Sub-publishers may have `coll` territories only.
- Integrators must not assume `own` and `coll` share the same `territory.include` array, or that sub-publishers mirror `SPU` ownership percentages.

---

## v1.00 r0 — Initial Release

> First public specification draft for CWR-JSON v1.0.

**Architecture**
- Two-phase mapper: `buildWorkModel` → `projectCanonicalFromModel`
- `PublisherRegistry` for publisher chain and PWR resolution
- Territory helpers: `upsertOwnTerritory`, `upsertCollectionTerritory`

**Format**
- JSON encoding of **CWR 2.x** work-registration records (primary target: **CWR 2.2 Revision 3** EDI)
- JSON Schema: [cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) (draft-07)
- Lookup table: [cwr_lookup_data_types_v1.0_r0.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json)
- Optional root `$schema` for interchange (not emitted by Playground today)

**Supported CWR record types (→ JSON)**
`HDR` `NWR` `REV` `ACK` `ALT` `NAT` `NWN` `NOW` `NPN` `SPU` `OPU` `SWR` `OWR` `PWR` `SWT` `OWT` `SPT` `OPT` `REC` `ARI` `XRF` `MSG`

**Data model**
- `parties`: writers at top level; publishers in `representedBy[]`; unlinked `E` publishers may appear at top level
- `parties[].territories[]`: `shareTypes` `own` / `coll`
- `recordings[]` with ISRC dedupe and `releases[].identifiers` (`ean`, `catalogNumber`)
- `identifiers[]` from `NWR`/`REV` and **`XRF`** (society, submitter, ISWC, ISRC cross-refs)
- GEMA `ARI` (035/GW) → `roleSplitM` / `roleSplitT` on `CA` writers
- `NWN` / `NOW` / `NPN` → `nameDomestic` / `nameScript`
- **CWR 2.2 Rev3** `PWR` relinquishment on publisher participants

**HDR → header (populated fields)**
`senderIdentifier`, `senderName`, `creationDate`, `creationTime`, `version` (CWR EDI version, e.g. `"2.1"`), `softwarePackage`
