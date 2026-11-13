---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    Each entry in the `works` array corresponds to one `NWR` or `REV`
    transaction in the source CWR file.
position: 3
privacy:
  view: public
slug: work-metadata
title: Work Metadata
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

See [Interested Parties](./interested-parties) and [Territories & Shares](./territories-shares).

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
    { "value": "BOHEMIAN RHAPSODY", "type": "TT" }
  ],
  "identifiers": [
    { "iswc": ["T-000.000.001-0"] },
    {
      "type": "submitterWorkId",
      "value": "EMI-00042",
      "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "EMI" }
    }
  ]
}
```

***

## Complete work object

See [Example: Simple NWR](./examples) for a full work with parties and recordings.