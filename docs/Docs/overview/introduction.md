---
title: Introduction
slug: introduction
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: 'What CWR-JSON is, why it exists, and how it relates to CWR EDI.'
---

# CWR-JSON

**CWR-JSON** is a JSON encoding of the [Common Works Registration (CWR)](https://www.cisac.org/formats) format — the global standard for registering musical works between publishers and collecting societies (PROs / MROs).

It preserves the full semantics of CWR EDI while replacing fixed-width ASCII records with a structured, human-readable JSON document. The result is a format that can be validated with JSON Schema, consumed directly by REST APIs, and read without a CWR parser.

---

## Why CWR-JSON?

CWR EDI has served the industry since the 1990s. Its fixed-width record format is proven but difficult to work with:

- No native validation tooling — parsers must be hand-built per record type
- Fixed column offsets are brittle and error-prone
- Opaque to anyone without a CWR spec in hand
- Incompatible with modern REST/JSON API infrastructure

CWR-JSON solves all four problems while remaining a **lossless representation** of the source data — nothing is dropped, simplified, or inferred.

---

## What CWR-JSON Covers (v1.0)

A CWR-JSON file produced by the **CWR-JSON Playground** reference implementation contains:

| Section | What it represents |
|---|---|
| `header` | File-level metadata from the CWR `HDR` record (sender, dates, CWR version, software) |
| `works[].titles` | All titles — original, alternate, non-Roman |
| `works[].identifiers` | One `{ iswc: string[] }` entry, plus namespaced triples from `XRF` |
| `works[].parties` | Ownership chain: writers → original publishers → sub-publishers; `own` shares without TIS scope, `coll` shares per TIS |
| `works[].recordings` | Commercial recordings (ISRC, album, label, release date) |
| `works[].messages` | Registration type, revocation flags, ACK messages, schema metadata |
| `works[].flags` | Anomalous work indicators, AI usage flags |

Territorial **collection** data from `SWT` / `OWT` / `SPT` / `OPT` records is represented inside `parties[].territories[]` as `shareTypes` with `type: "coll"`.

---

## The Pipeline

```
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
schemaV1.convert             SchemaV1Output (Playground / download JSON)
```

| Stage | Module |
|--------|--------|
| Parse lines | `src/cwr-sdk/parser/tokenizer.ts`, `recordParser.ts`, `blockExtractor.ts` |
| Map semantics | `src/cwr-sdk/mapper/workModel/buildWorkModel.ts` |
| Canonical JSON | `src/cwr-sdk/mapper/workModel/projectCanonical.ts` |
| Public API | `src/cwr-sdk/mapper/canonicalMapper.ts` → `toCanonical()` / `toCanonicalFromLines()` |
| v1.0 envelope | `src/cwr-sdk/mapper/schemas/schemaV1.ts` |

The Playground stores **`ParsedCwrFile`** after upload. The JSON tree and download apply **`schemaV1.convert()`**, which adds `messages.schema` and `messages.schemaDescription` on each work.

Future **format** versions (e.g. v1.1) can add a new serialiser against the same canonical model — CWR line parsing does not need to change. Any format bump is a release entry under [Version governance](./changelog#version-governance). The format number is public when that entry is on the changelog.

---

## Relationship to Other Standards

| Standard | Relationship |
|---|---|
| **CWR 2.x** (through **2.2 Rev3**) | Source EDI format — CWR-JSON is a JSON encoding of CWR registration data |
| **CAF-JSON** | Sibling format — Common Agreement Format in JSON (agreements/shares between publishers and societies) |
| **ISWC (ISO 15707)** | Work identifier in `works[].identifiers[]` as `{ iswc: string[] }`, emitted as `T-NNN.NNN.NNN-C` |
| **TIS Numeric Codes** | Territory identifier system used in `parties[].territories[]` |
| **IPI Name/Base Numbers** | Interested Party identifier used in `parties[].ipi` |

---

## Document ID & Version

| Property | Value |
|---|---|
| Document ID | `PUBCWRJSON21-0703` |
| Format Version | `1.0.1` |
| Revision | `0` |
| Status | Published |
| Prepared by | Society Publisher Forum (SPF) |
| Related document | PUBCWRJSON21-0704 – CWR-JSON User Guide |
| Reference implementation | CWR-JSON Playground — `src/cwr-sdk` in this repository |

Format `1.0.1` is **Published**. When each version level changes: [Version governance](./changelog#version-governance).
