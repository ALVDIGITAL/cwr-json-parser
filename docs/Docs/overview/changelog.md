---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: Version history for CWR-JSON.
parent:
  uri: overview
position: 2
privacy:
  view: public
slug: changelog
title: Changelog
---
**CWR-JSON format version `1.0.1` is the current interchange schema.** The schema file stays [`cwr-json-schema-v1.0.schema.json`](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json). Further field-shape changes are frozen unless this changelog records an explicit **format** bump.

| Change type | Affects your integration? |
|---|---|
| **Format** (new `works[]` fields, renamed properties, new required fields) | **Yes** — plan migration; we will announce here in advance |
| **Documentation** (terminology, pipeline description, examples) | **No** — same JSON output |
| **Validation** (stricter JSON Schema, lookup tables, semantic rules) | **Maybe** — same field shapes; hand-edited JSON may fail where it previously passed |

Integrators (including downstream export pipelines) should treat this page as the source of truth for format and validation changes. Contact the SPF committee for advance notice of any planned format revision.

### Version governance

Societies implement the **format version** `MAJOR.MINOR.PATCH`. Current value: **1.0.1**, status **Published**. A changelog release entry on this page assigns the format number and the status **Published**.

These rules apply to every release after format `1.0.1`. Format `1.0.1` stays as published.

- **MAJOR** (`2.0.0`): a previous reader cannot accept the new file, or a new reader cannot accept the previous file, without a migration. Field removed or renamed, type changed, new required field, meaning change. New schema file `cwr-json-schema-v{MAJOR}.0.schema.json`. The previous major stays available. At most two format versions stay in active circulation; the oldest is retired when a third would ship.
- **MINOR** (`1.1.0`): additive and optional only. New optional field or optional enum value. Files from the previous minor still validate. Schema filename bumps to `cwr-json-schema-v{MAJOR}.{MINOR}.schema.json`.
- **PATCH** (`1.0.2`): same JSON shape. Errata, examples, wording. Schema filename stays `v{MAJOR}.{MINOR}`.

Record the following on their own lines. They leave the format version unchanged:

- **Implementations**: releases of converters or tools (including the reference implementation) are not format releases and are not listed here.
- **Validation** (`1.x.y`): stricter schema, lookup checks, or semantic rules on the same shapes. Hand-edited JSON may start failing. Lookup file revision suffix `_rN` bumps only when lookup content changes (`cwr_lookup_data_types_v{MAJOR}.{MINOR}_r{N}.json`).
- **Document revision** in the [Introduction](/docs/introduction) identity table tracks spec-text revision of the current format. Wording-only edits bump that revision. Format MAJOR, MINOR, and PATCH stay put.

The format number is public when the changelog entry for that number is the release entry.

---

## 2026-11-12 — Documentation errata (no format bump)

> Format `1.0.1`. Schema filename stays `cwr-json-schema-v1.0.schema.json`. No change to the schema or lookup table. Specification text only. Document revision `1`.

- [Introduction](/docs/introduction): the identity table separates the technical format status (`1.0.1`, Published) from the SPF formal approval status, and lists the schema and lookup files.
- [Examples](/docs/examples): complete documents for real CWR EDI files: an `NWR` with `XRF`, a CWR 2.2 `REV` with publisher chains, and an `ACK` with `MSG`. A fourth example adds sender-supplied `conventions` and `tags`. Every block passes the published schema and the strict semantic rules.
- [Getting Started](/docs/getting-started): the steps a converter follows, and a minimal complete document for a real `NWR`. `submitterWorkId` `source.value` matches `header.senderIdentifier`.
- `flags.aiUsage`: use the CISAC CWR 2.2 Rev. 3 codes `M` (music), `T` (text), `A` (all).
- Root `$schema` is not allowed in data files. The format `1.0.1` schema rejects extra root properties, including `$schema`.
- [Schema Validation](/docs/schema-validation):
  - One lookup file: `cwr_lookup_data_types_v1.0_r0.json`.
  - Identifier section (`oneOf` ISWC entry or `{ type, value, source? }`).
  - Exact `ID_UNIQUE_SUBMITTER` field mapping.
  - AJV example tested with Ajv 8 (`strict: false`).
- [Header Metadata](/docs/header-metadata): table of fields populated from CWR EDI vs supplied by the sender. Documented that `conventions` is omitted for mixed representations.
- [Role codes and title types](/docs/role-codes-rights-title-types):
  - Role and title-type descriptions aligned with the CISAC lookup (`ES` Substituted Publisher, `TE` First Line of Text, `RT` Restricted Title, …).
  - Missing writer codes `AD`, `SR`, `SA`, `TR` added.
- Relinquishment trigger now lists its two conditions. `releaseDate` `"00000000"` is documented.
- `messages.revocation.reason` and `flags.anomalousReason` take CISAC codes (`NE`/`NM`/`NC`/`AN`, `IPS`/`UNA`), not free text.
- [Interested Parties](/docs/interested-parties):
  - Writer `name` order defined as first name + last name.
  - Only unlinked `E` publishers may appear at the top level of `parties[]`. `SE` / `AM` / `PA` are always nested under an `E`.
  - An empty `ipi` must be omitted.
  - `roleName`, party-level `agreementNumber` and party-level `shares` marked as reserved (no CWR EDI source in format `1.0.1`).
- [Territories & Shares](/docs/territories-shares):
  - `territory.exclude` is mandatory (the schema requires both arrays).
  - An `own` entry holds exactly one share type.
  - `coll` shares carry no `society`; examples corrected.
  - Rule for merging collection rows with equal shares, and both TIS code forms (`"0276"` / `"276"`).
- `messages.relinquishment` marked as reserved; relinquishment comes from `PWR` on the publisher. `messages.revocation` and `flags.anomalous` define the value for `"N"` indicators.
- `messages.schema` and `messages.schemaDescription` are free-text labels set by the converter.
- Every `json` code block in the specification parses as JSON and validates against the published schema.
- Entries below dated before 2026-10-19 describe the format `1.0.0` identifier model (`identifiers[].source` as a string, ISWC/ISRC as identifier rows). Format `1.0.1` supersedes that model.

---

## 2026-10-23 — Optional `tags` on header and messages

> Format `1.0.1`. Schema filename stays `cwr-json-schema-v1.0.schema.json`. Not mapped from CWR EDI. The sender sets the tags on the JSON file.

- Optional `tags` on `header` (file level) and `works[].messages` (work level).
- Each tag is `{ "name": "custom", "value": ["example"] }`. `name` is required. `value` is a string array with at least one string.
- Same object already used on recordings and releases.

## 2026-10-19 — Identifier placement clarification

> Format `1.0.1`. Schema filename stays `cwr-json-schema-v1.0.schema.json`. Supersedes the `works[].iswc` and `works[].isrc` placement in the "Format 1.0.1 identifiers" entry below.

- ISWC is one `identifiers[]` entry, `{ "iswc": ["T-034.524.680-1"] }`. It is not a `{ type, value, source }` triple. `works[].iswc` is removed.
- `works[].isrc` is removed. `XRF.IdentifierType` chooses the node.
- `W` uses the org code. `ISW` appends to the `iswc` entry. Digits are `societyWorkId` / `cisacSociety`. 2–3 letters are `publisherWorkId` / `cwrSubmitter`. Any other org is `{ "type": "proprietary", "value" }` with no `source`.
- `R` with a valid ISRC stays on `recordings[].isrc` when it already matches. Each unmatched code is its own recording, `{ "isrc": ["..."] }`.
- `P` with a 13-digit EAN is its own recording, `{ "releases": [{ "ean": ["..."] }] }`. It is not attached to other recordings.
- `V` is not mapped.

## 2026-10-19 — Format 1.0.1 identifiers

> Format bump. Schema filename stays `cwr-json-schema-v1.0.schema.json`. ISWC and unmatched ISRC placement is superseded by the "Identifier placement clarification" entry above.

- `works[].iswc`, `works[].isrc`, `recordings[].isrc`, and `recordings[].releases[].ean` are string arrays. ISWC, ISRC, and EAN leave `identifiers[]`.
- `identifiers[]` is a triple: `type`, `value`, and optional `source` (`type`, `value`, optional `name`). `source.type` is `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid`.
- `NWR.SubmitterWorkNumber` is `submitterWorkId` with `source.type` `cwrSubmitter` from the `HDR` sender. `XRF` society codes are `societyWorkId` / `cisacSociety`. `XRF` 2–3 letter codes are `publisherWorkId` / `cwrSubmitter`. A missing org is `{ "type": "proprietary", "value" }` with no `source`.
- An `XRF` `ISR` that matches a recording ISRC is not copied again. One that matches no recording is kept on `works[].isrc`.
- Release catalog number stays on `catno` only.
- Schema accepts dotted `T-NNN.NNN.NNN-C`, compact `TNNNNNNNNNC`, and intermediate `T-NNNNNNNNN-C`. Converters should write dotted ISO.
- Optional `tags` on recordings and releases: `{ "name": "mood", "value": ["happy", "fun"] }`. Not mapped from CWR EDI.

## 2026-10-14 — Optional `header.conventions`

> Additive optional field on CWR-JSON v1.0. Files without `conventions` stay valid. A validator that has not picked up this schema rejects files that include it.

- `header.conventions` declares how the file represents writers and publisher shares.
- `writerControl`: `swrOnly` or `swrOwr`.
- `publisherShare`: `summed` or `perWriterChain`.
- When `conventions` is present, both fields are required.
- Not mapped from the CWR `HDR` record. The sender sets it on the JSON file.

## 2026-07-26 — ACK support (format additive)

> **Additive only.** Existing `nwr`/`rev` shapes unchanged. `MessageType` gains `"ack"`; optional ACK fields and richer `msgs[]` properties documented.

**Mapping**
- In a GRH group with `TransactionType=ACK`, each `ACK` record starts a new work (nested `NWR`/`REV` belong to the same work).
- Flat ACK fields on `works[].messages` (`type: "ack"`, `transactionStatus`, dates, creation numbers, …).
- `MSG` → `messages.msgs[]` with `status`, `message`, plus `originalRecordSequence`, `recordType`, `messageLevel`, `validationNumber`.
- A nested `NWR` after `ACK` does not change `messages.type`; it stays `"ack"`.

**Validation**
- `MessageType` enum includes `"ack"`.
- `msgs[]` allows the extra MSG columns listed above.

---

## 2026-06-30 — `XRF` identifiers (superseded)

> **No change to CWR-JSON format `1.0.0` object shapes.** `works[].identifiers[]` gains rows from `XRF` records; JSON Schema `identifierSources` enum widened.
>
> **Superseded by format `1.0.1`.** The `{ source, value }` identifier rows below are no longer valid. See the 2026-10-19 "Format 1.0.1 identifiers" entry above.

**Mapping**
- **`XRF` (Work ID Cross Reference)** → `works[].identifiers[]`: `OrganisationCode` becomes `source`, `Identifier` becomes `value`.
- Special org codes: `ISW` → `source: "iswc"`; `ISR` → `source: "isrc"`.
- Society codes (e.g. `035`) and CWR submitter IDs (e.g. `EMI`) are valid `source` values; org `000` / `099` rows are skipped.
- Duplicate `{source, value}` pairs are deduplicated (including overlap with `NWR` ISWC).

**Validation**
- `identifierSources` lookup set merges canonical sources with CISAC society codes and `isrc`.
- `identifiers[].source` accepts the enum **or** `^[A-Z]{2,3}$` for publisher submitter codes.
- ISRC format enforced on `identifiers[]` when `source` is `isrc`.

---

## 2026-06-22 — Collection territory merging rules (no format bump)

> **No change to CWR-JSON format `1.0.0` field shapes.** Rules for collection territories and sub-publisher chains.

- Zero-share `SPT`/`SWT` records merge TIS `include`/`exclude` into the active `coll` territory instead of creating a separate territory with zero-value shares.
- Share arrays omit `value: 0` entries (see [Territories & Shares](/docs/territories-shares)).
- A repeated `SPU` for the same sub-publisher under one `E` chain appears once; the same `partyId` under different `E` parents stays separate.

---

## 2026-06-17 — Society code normalization (no format bump)

> **No change to CWR-JSON format `1.0.0` field shapes.**

**Validation 1.1.2 (patch)**
- Optional normalization strips empty and `000` society codes on shares before validation.
- Blank/`000` society codes are omitted from shares (matches CWR EDI semantics).

---

## 2026-06-15 — Validation 1.1.2 (no format bump)

> **No change to CWR-JSON format `1.0.0` field shapes.**

**Validation 1.1.2**
- Lookup revision **r1**: CISAC society, character set, language, revocation, and anomalous-work enums in published lookup + JSON Schema.
- JSON Schema validates `shares[].society`, `header.characterSet`, `revocation.reason`, `flags.anomalousReason`.

---

## 2026-06-03 — Validation UX & normalization (no format bump)

> **No change to CWR-JSON format `1.0.0` field shapes.** Validation ergonomics and optional pre-validation cleanup.

**Validation 1.1.1**
- Optional **normalization** before validation: compact ISWC → `T-NNNNNNNNN-C`, split combined `own`/`coll` territory rows, strip invalid `own` on sub-publishers.
- Strict checks on a sender's own output should skip normalization.
- Semantic rules identified by rule codes (see [Schema Validation](/docs/schema-validation)).
- TIS lookup sourced from **CISAC TIS** export (see [TIS Territory Codes](/docs/tis-territory-codes) and the [published lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json)).

---

## 2026-06-03 — Validation 1.1.0 (no format bump)

> **No change to CWR-JSON format `1.0.0` field shapes.** Stricter JSON Schema and semantic validation only.

**Validation 1.1.0**
- Published [lookup table](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) (`cwr_lookup_data_types_v1.0_r0.json`): role codes, title types, identifier sources, full TIS table (CISAC groups + ISO 3166-1 numeric).
- [JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) (`cwr-json-schema-v1.0.schema.json`) injects lookup enums and field patterns.
- Semantic rules in strict mode: TIS include/exclude overlap, sub-publisher no `own`, publisher `own` only for `E`, unique `submitterWorkNumber` per file.
- See [Schema Validation](/docs/schema-validation) and [TIS Territory Codes](/docs/tis-territory-codes).

---

## 2026-06-03 — Documentation errata (no format bump)

> **No change to CWR-JSON format `1.0.0` output.** Specification and validation documentation only.

- There is no separate CWR 3.x EDI format; features such as publisher **relinquishment** come from **CWR 2.2 Revision 3** (`PWR` records).
- [Schema Validation](/docs/schema-validation) updated: published schema and lookup URLs, structural vs semantic validation rules.

**Ownership vs collection territory placement** (see [Territories & Shares](/docs/territories-shares))
- **`shareTypes[].type: "own"`** (from `SWR` / `OWR` / `SPU` / `OPU`) is **not** scoped to TIS codes. It is stored in a `territories[]` entry with `territory.include: []` and `territory.exclude: []`.
- **`shareTypes[].type: "coll"`** (from `SWT` / `OWT` / `SPT` / `OPT`) **is** scoped to TIS include/exclude on the same or separate `territories[]` entries.
- **Sub-publishers** (`SE`, `AM`, `PA`) do **not** carry ownership shares in JSON — only **original publishers** (`E`) carry `own`. Sub-publishers may have `coll` territories only.
- Integrators must not assume `own` and `coll` share the same `territory.include` array, or that sub-publishers mirror `SPU` ownership percentages.

---

## Format 1.0.0 — Initial Release

> First public specification release for CWR-JSON (format `1.0.0`).
>
> The identifier model and the "optional root `$schema`" note in this entry are superseded by format `1.0.1` and the 2026-11-12 errata.

**Format**
- JSON encoding of **CWR 2.x** work-registration records (primary target: **CWR 2.2 Revision 3** EDI)
- JSON Schema: [cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) — published JSON Schema for format 1.0
- Lookup table: [cwr_lookup_data_types_v1.0_r0.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json)
- Optional root `$schema` (since removed)

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

**HDR → header (mapped fields)**
`senderIdentifier`, `senderName`, `creationDate`, `creationTime`, `version` (CWR EDI version, e.g. `"2.1"`), `softwarePackage`
