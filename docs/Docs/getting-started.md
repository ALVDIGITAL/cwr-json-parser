---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    This guide takes you from a raw CWR EDI file to a CWR-JSON document in three
    steps. Build your own converter from the schema, or try the **CWR-JSON
    Playground** first.
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
## Step 1. Know what maps

CWR-JSON v1.0 covers:

- `NWR` / `REV` work registration transactions
- Related detail records (`ALT`, `NAT`, `SPU`/`OPU`, `SWR`/`OWR`, `PWR`, `SPT`/`OPT`, `SWT`/`OWT`, `REC`, `ARI`, `XRF`, `MSG`)

Acknowledgement (`ACK`) transactions map to a work with `messages.type: "ack"`, flat ACK fields on `messages`, and `MSG` rows in `messages.msgs[]`. Nested `NWR`/`REV` detail still fills titles, identifiers, parties, and flags.

***

## Step 2. Convert

A converter does three things:

1. **Parse** each fixed-width CWR line into its fields, using the CWR 2.x record layouts (each field at its exact byte offset).
2. **Map** the fields of each transaction to one entry in `works[]`, following the field tables in this specification ([Header Metadata](/docs/header-metadata), [Work Metadata](/docs/work-metadata), [Interested Parties](/docs/interested-parties), [Sound Recordings](/docs/sound-recordings), [CWR two-way conversion](/docs/two-way-conversion)).
3. **Write** the result as one JSON object with `header` and `works`.

To see the expected result for your own files before you build a converter, upload a CWR file (`.cwr`, `.v21` or `.v22`) to the <Anchor target="_blank" href="https://cwr.alvdev.com/#/">CWR-JSON Playground&#x20;</Anchor>.

***

## Step 3. Validate

Validate every file against the published JSON Schema and the semantic rules (see [Schema Validation](/docs/schema-validation)):

[cwr-json-schema-v1.0.schema.json](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json)

***

## Minimal valid document

Source CWR (one `NWR` with an ISWC and a submitter work number):

```
HDR00000000001XRF SAMPLE PUBLISHER                         02.202026063012000020260630
GRHNWR0000102.20
NWR0000000100000000XRF IDENTIFIER DEMO WORK                                      SW00000000001 T0000000010                    POP      U      ORI
```

CWR-JSON (passes the published JSON Schema and the semantic rules in strict mode):

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

- The `NWR` ISWC `T0000000010` becomes one `{ "iswc": [...] }` entry, written in dotted form `T-NNN.NNN.NNN-C`.
- Empty `flags`, `parties` and `recordings` are optional. Writing them empty or omitting them are both valid.
- `NWR.SubmitterWorkNumber` becomes `type: "submitterWorkId"`. `source.value` and `source.name` come from the `HDR` sender identifier and sender name.
- `messages.schema` and `messages.schemaDescription` are required on every work.

More complete documents (parties, territories, recordings, ACK) are on the [Examples](/docs/examples) page.

> Do not add a root `$schema` property. The format `1.0.1` schema does not allow extra root properties, so a file with `$schema` fails validation (`EXTRA_PROPERTY`). See [Schema Validation](/docs/schema-validation#declaring-the-schema-version).

<br />