---
appearance:
  table_of_contents: default
category:
  uri: Docs
parent:
  uri: overview
position: 0
privacy:
  view: public
slug: introduction
title: Introduction
---
# CWR-JSON

**CWR-JSON** is a JSON encoding of the <Anchor target="_blank" href="https://www.alv-software.com/cwr/">Common Works Registration (CWR)</Anchor> format — the global standard for registering musical works between publishers and collecting societies (PROs / MROs).

It preserves the full semantics of CWR EDI while replacing fixed-width ASCII records with a structured, human-readable JSON document. The result is a format that can be validated with JSON Schema, consumed directly by REST APIs, and read without a CWR parser.

---

<Callout icon="🔗" theme="info">
  ### <Anchor target="_blank" href="https://www.alv-software.com/cwr/">CWR for Music Publishers</Anchor>
</Callout>

## Why CWR-JSON?

CWR EDI has served the industry since the 1990s. Its fixed-width record format is proven but difficult to work with:

- No native validation tooling — parsers must be hand-built per record type
- Fixed column offsets are brittle and error-prone
- Opaque to anyone without a CWR spec in hand
- Incompatible with modern REST/JSON API infrastructure

CWR-JSON solves all four problems while remaining a **lossless representation** of the source data — nothing is dropped, simplified, or inferred.

---

## What CWR-JSON Covers (v1.0)

A CWR-JSON file contains:

| Section | What it represents |
|---|---|
| `header` | File-level metadata from the CWR `HDR` record (sender, dates, CWR version, software) |
| `header.conventions` | Optional. How the file represents writers and publisher shares. Supplied by the sender, not mapped from CWR EDI |
| `header.tags`, `works[].messages.tags`, `recordings[].tags`, `releases[].tags` | Optional `{ name, value[] }` labels. Supplied by the sender, not mapped from CWR EDI |
| `works[].titles` | All titles — original, alternate, non-Roman |
| `works[].identifiers` | One `{ iswc: string[] }` entry, plus `{ type, value, source? }` entries for the submitter work number (`NWR`/`REV`) and `XRF` cross-references |
| `works[].parties` | Ownership chain: writers → original publishers → sub-publishers; `own` shares without TIS scope, `coll` shares per TIS |
| `works[].recordings` | Commercial recordings (ISRC, album, label, release date) |
| `works[].messages` | Registration type, revocation flags, ACK messages, schema metadata |
| `works[].flags` | Anomalous work indicators, AI usage flags |

Territorial **collection** data from `SWT` / `OWT` / `SPT` / `OPT` records is represented inside `parties[].territories[]` as `shareTypes` with `type: "coll"`.

---

## Relationship to Other Standards

| Standard | Relationship |
|---|---|
| **CWR 2.x** (through **2.2 Rev3**) | Source EDI format — CWR-JSON is a JSON encoding of CWR registration data |
| **CAF-JSON** | Sibling format — Common Agreement Format in JSON (agreements/shares between publishers and societies) |
| **ISWC (ISO 15707)** | Work identifier in `works[].identifiers[]` as `{ iswc: string[] }`, written as `T-NNN.NNN.NNN-C` |
| **TIS Numeric Codes** | Territory identifier system used in `parties[].territories[]` |
| **IPI Name/Base Numbers** | Interested Party identifier used in `parties[].ipi` |

---

## Document version

| Property | Value |
|---|---|
| Technical format version | `1.0.1` |
| Technical format status | Published (interchange format released in the [Changelog](/docs/changelog)) |
| SPF formal approval status | Pending SPF confirmation |
| Document revision | `1` |
| JSON Schema file | [`cwr-json-schema-v1.0.schema.json`](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) (filename unchanged for format `1.0.1`) |
| Lookup table file | [`cwr_lookup_data_types_v1.0_r0.json`](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/lookups/cwr_lookup_data_types_v1.0_r0.json) |
| Prepared by | Society Publisher Forum (SPF) |

**Technical format status** says whether the JSON shape is released for interchange. Format `1.0.1` is Published: implementers can generate and validate it today. **SPF formal approval status** is the governance approval of this specification text by the SPF. The two are tracked separately. When each version level changes: [Version governance](/docs/changelog#version-governance).

---

## Reference implementation (informative)

> Not part of the specification. This section describes the ALV CWR-JSON Playground, one implementation of this spec. Integrators build their own converter from the [JSON Schema](/docs/schema-validation) and these pages; where this section and the specification pages differ, the specification pages apply.

| Property | Value |
|---|---|
| Tool | <Anchor target="_blank" href="https://cwr.alvdev.com/#/">CWR-JSON Playground</Anchor> |
| Package | `@alvdigital/cwr-json-parser` `1.5.3` (private) |

The Playground converts in four stages:

```text
CWR EDI text
    │
    ▼
tokenizer + recordParser     lines → { CWR field labels }
    │
    ▼
buildWorkModel               internal WorkModel (per work block)
    │
    ▼
projectCanonicalFromModel    ParsedCwrFile (CanonicalWork[])
    │
    ▼
schemaV1.convert             CWR-JSON v1.0 (adds messages.schema and messages.schemaDescription)
```

Shares and territories are built by `upsertOwnTerritory` / `upsertCollectionTerritory`; publisher chains and `PWR` links are resolved by `PublisherRegistry`.
