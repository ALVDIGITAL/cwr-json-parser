---
title: Getting Started
metadata:
  robots: index
content:
  excerpt: >-
    This guide takes you from a raw CWR EDI file to a CWR-JSON document in three
    steps using the **CWR-JSON Playground** reference implementation.
privacy:
  view: public
---
## Step 1. Upload your CWR file

Open the <Anchor target="_blank" href="https://cwr.alvdev.com/#/">Playground&#x20;</Anchor>and upload any `.cwr` or `.v21` file.

Supported for conversion today:

- `NWR` / `REV` work registration transactions
- Related detail records (`ALT`, `NAT`, parties, territories, `REC`, `ARI`, `XRF`, `MSG`, etc.)

Acknowledgement (`ACK`) files may be parsed for preview; full ACK serialisation is [planned](./changelog).

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

```json
{
  "header": {
    "senderIdentifier": "EMI",
    "senderName": "EMI MUSIC PUBLISHING LTD",
    "creationDate": "20260101",
    "creationTime": "120000"
  },
  "works": [
    {
      "messages": {
        "type": "nwr",
        "schema": "CWR-JSON Schema v1.0",
        "schemaDescription": "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits."
      },
      "titles": [
        { "value": "BOHEMIAN RHAPSODY", "type": "TT" }
      ],
      "iswc": ["T-000.000.001-0"],
      "identifiers": [
        {
          "type": "submitterWorkId",
          "value": "EMI-00042",
          "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "EMI" }
        }
      ]
    }
  ]
}
```

> The Playground does not add a root `$schema` property today. For file exchange with societies, you may add `"$schema": "https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json"` manually (see [Changelog](./changelog)).

<br />
