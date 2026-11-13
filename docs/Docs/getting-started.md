---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    This guide takes you from a raw CWR EDI file to a CWR-JSON document in three
    steps using the **CWR-JSON Playground** reference implementation.
  next:
    pages:
      - slug: schema-validation
        title: Schema Validation
        type: basic
      - slug: work-metadata
        title: Work Metadata
        type: basic
position: 1
privacy:
  view: public
slug: getting-started
title: Getting Started
---
## Step 1. Upload your CWR file

Open the <Anchor target="_blank" href="https://cwr.alvdev.com/#/">Playground&#x20;</Anchor>and upload a CWR file (for example `.cwr`, `.v21` or `.v22`).

Supported for conversion today:

- `NWR` / `REV` work registration transactions
- Related detail records (`ALT`, `NAT`, `SPU`/`OPU`, `SWR`/`OWR`, `PWR`, `SPT`/`OPT`, `SWT`/`OWT`, `REC`, `ARI`, `XRF`, `MSG`)

Acknowledgement (`ACK`) files are supported for field-level EDI preview and for v1 JSON: each ACK transaction maps to a work with `messages.type: "ack"`, flat ACK fields on `messages`, and `MSG` rows in `messages.msgs[]`. Nested `NWR`/`REV` detail still fills titles, identifiers, parties, and flags.

***

## Step 2. Review the conversion

The <Anchor target="_blank" href="https://cwr.alvdev.com/#/">Playground&#x20;</Anchor>runs three stages automatically:

**Stage 1 — Parse**<br />Each line is parsed using fixed-width field definitions (`recordDefinitions`). Every field is extracted at its exact byte offset.

**Stage 2 — Map to canonical form**<br />Parsed fields are mapped to a `CanonicalWork` structure (schema-agnostic, defined in `src/cwr-sdk/types/cwr.ts`).

**Stage 3 — Serialise to CWR-JSON v1.0**<br />The canonical form is serialised via `schemaV1` to the v1.0 output shape.

***

## Step 3. Validate and download

Validate the output against the published JSON Schema (optional but recommended):

[cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json)

Download the `.json` file for storage, APIs, or further processing.

***

## Minimal valid output

Source CWR (one `NWR` with an ISWC and a submitter work number):

```
HDR00000000001XRF SAMPLE PUBLISHER                         02.202026063012000020260630
GRHNWR0000102.20
NWR0000000100000000XRF IDENTIFIER DEMO WORK                                      SW00000000001 T0000000010                    POP      U      ORI
```

Parser output (passes the published JSON Schema and the semantic rules in strict mode):

```json
{
  "header": {
    "senderIdentifier": "00000000001",
    "senderName": "XRF SAMPLE PUBLISHER",
    "creationDate": "20260630",
    "creationTime": "120000"
  },
  "works": [
    {
      "messages": {
        "type": "nwr",
        "schema": "CWR-JSON Schema v1.0",
        "schemaDescription": "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits."
      },
      "flags": {},
      "titles": [
        { "value": "XRF IDENTIFIER DEMO WORK", "type": "TT" }
      ],
      "identifiers": [
        { "iswc": ["T-000.000.001-0"] },
        {
          "type": "submitterWorkId",
          "value": "SW00000000001",
          "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "XRF SAMPLE PUBLISHER" }
        }
      ],
      "parties": [],
      "recordings": []
    }
  ]
}
```

- The `NWR` ISWC `T0000000010` becomes one `{ "iswc": [...] }` entry, emitted in dotted form `T-NNN.NNN.NNN-C`.
- The parser emits `flags`, `parties` and `recordings` even when they are empty. Both forms are valid; hand-built files may omit them.
- `NWR.SubmitterWorkNumber` becomes `type: "submitterWorkId"`. `source.value` and `source.name` come from the `HDR` sender identifier and sender name.
- `messages.schema` and `messages.schemaDescription` are required on every work.

More complete outputs (parties, territories, recordings, ACK) are on the [Examples](/docs/examples) page.

> Do not add a root `$schema` property. The format `1.0.1` schema does not allow extra root properties, so a file with `$schema` fails validation (`EXTRA_PROPERTY`). This is an open item for the CWR-JSON subgroup; see [Schema Validation](/docs/schema-validation#declaring-the-schema-version).

<br />