---
title: Work Metadata
metadata:
  robots: index
content:
  excerpt: >-
    Each entry in the `works` array corresponds to one `NWR` or `REV`
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
| `identifiers` | array  | O   | All identifiers (ISWC, submitter work number, proprietary IDs)                                                                             |
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
    { "source": "iswc", "value": "T-000.000.001-0" },
    { "source": "submitterWorkNumber", "value": "EMI-00042" }
  ]
}
```

***

## Complete work object

See [Example: Simple NWR](./examples) for a full work with parties and recordings.
