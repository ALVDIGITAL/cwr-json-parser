---
title: Work Metadata
metadata:
  robots: index
content:
  excerpt: >-
    Each entry in the `works` array corresponds to one `NWR`, `REV` or `ACK`
    transaction in the source CWR file.
privacy:
  view: public
---
## Fields

| Field         | Type   | Req | Description                                                                                                                                |
| ------------- | ------ | --- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `messages`    | object | M   | Registration metadata, ACK messages, and schema metadata (`schema`, `schemaDescription`)                                                   |
| `flags`       | object | O   | Boolean indicators from the registration record                                                                                            |
| `titles`      | array  | O   | All titles for the work (original, alternate, non-Roman)                                                                                   |
| `identifiers` | array  | O   | One `{ iswc: string[] }` entry plus namespaced triples (submitter, society, publisher)                                                     |
| `parties`     | array  | O   | **Ownership chain** — writers and publishers with hierarchical `representedBy` nesting and per-territory shares (ownership and collection) |
| `recordings`  | array  | O   | Commercial recordings (ISRC, album, label, release date)                                                                                   |

***

## Territorial shares

Shares are represented inside `parties[].territories[]`:

- `shareTypes[].type: "own"` — ownership from `SPU`/`OPU`/`SWR`/`OWR` (empty TIS scope, not territory-coded)
- `shareTypes[].type: "coll"` — collection percentages for that territory

See [Interested Parties](/docs/interested-parties) and [Territories & Shares](/docs/territories-shares).

***

## Minimal work object

```json
{
  "messages": {
    "type": "nwr",
    "schema": "CWR-JSON Schema v1.0",
    "schemaDescription": "..."
  },
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
  ]
}
```

`source.value` and `source.name` on `submitterWorkId` repeat `header.senderIdentifier` and `header.senderName` of the same file.

***

## Complete work object

See [Examples](/docs/example-simple-nwr) for complete parser-generated documents with parties, territories, recordings and an ACK.
