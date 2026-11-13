---
appearance:
  table_of_contents: default
category:
  uri: Docs
parent:
  uri: interested-parties
position: 0
privacy:
  view: public
slug: territories-shares
title: Territories & Shares
---
---
title: Territories & Shares
metadata:
  robots: index
privacy:
  view: public
---
Territory entries appear in `parties[].territories[]` (v1.0). **Collection** shares are tied to TIS codes; **ownership** shares are not.

***

## Ownership vs collection (important)

| `shareTypes[].type` | CWR source records | TIS on `territory` |
| ------------------- | ------------------ | ------------------ |
| `"own"`             | `SWR`, `OWR`, `SPU`, `OPU` | **None** — always `include: []`, `exclude: []` |
| `"coll"`            | `SWT`, `OWT`, `SPT`, `OPT` | **Yes** — `include` / `exclude` from the territory record |

The mapper keeps these in **separate** `territories[]` entries when both exist. Do not merge `own` into a collection row that carries TIS codes such as `2136` (World).

**Sub-publishers** (`SE`, `AM`, `PA`) only receive **`coll`** territories (from `SPT` / `OPT`). They never receive `shareTypes[].type: "own"` in v1.0 output — only **original publishers** (`role: "E"`) and **writers** emit ownership shares.

Implementation: `upsertOwnTerritory` / `upsertCollectionTerritory` in `src/cwr-sdk/mapper/territoryUtils.ts`; publisher ownership eligibility: `isPublisherOwnEligible()` (role `E` only) in `parseHelpers.ts`.

***

## Territory Entry Object

| Field               | Type      | Req | Description                                                                                                                                           |
| ------------------- | --------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `territory.include` | string\[] | M   | TIS Numeric Codes for **collection** scope. For an **`own`-only** entry, both `include` and `exclude` are `[]`. `["2136"]` = World when used for `coll`. |
| `territory.exclude` | string\[] | O   | TIS Numeric Codes excluded from **collection** scope                                                                                                  |
| `shareTypes`        | array     | M   | One or two entries: `"own"` and/or `"coll"` (typically one type per entry)                                                                            |
| `agreementNumber`   | object    | O   | Agreement number for this territory: `{ source?, value }`. `source` is typically a society code. Often on **`coll`** entries.                         |

***

## shareTypes Entry

| Field    | Type   | Req | Description                                     |
| -------- | ------ | --- | ----------------------------------------------- |
| `type`   | string | M   | `"own"` (ownership) or `"coll"` (collection)    |
| `shares` | array  | M   | One entry per rights type with a non-zero value |

***

## Share Object

| Field        | Type   | Req | Description                                                                                                          |
| ------------ | ------ | --- | -------------------------------------------------------------------------------------------------------------------- |
| `rightsType` | string | M   | `"pr"`, `"mr"`, or `"sr"`                                                                                            |
| `value`      | number | M   | Share as a decimal percentage (0–100). Derived from raw CWR share field divided by 100. E.g., CWR `005000` → `50.00` |
| `society`    | string | O   | Affiliation society code for this share (e.g., `"035"` = GEMA, `"052"` = PRS)                                        |

***

## own vs coll

| Type     | Source records             | Meaning                                               |
| -------- | -------------------------- | ----------------------------------------------------- |
| `"own"`  | `SPU`, `OPU`, `SWR`, `OWR` | Declared **ownership** percentage (not territory-scoped in JSON) |
| `"coll"` | `SPT`, `OPT`, `SWT`, `OWT` | **Collection** right in the TIS scope on that entry     |

***

## Example (writer + E publisher + SE sub-publisher)

```json
"territories": [
  {
    "territory": { "include": [], "exclude": [] },
    "shareTypes": [
      {
        "type": "own",
        "shares": [
          { "rightsType": "pr", "value": 50, "society": "010" }
        ]
      }
    ]
  },
  {
    "territory": { "include": ["2136"], "exclude": [] },
    "shareTypes": [
      {
        "type": "coll",
        "shares": [
          { "rightsType": "pr", "value": 50, "society": "010" }
        ]
      }
    ],
    "agreementNumber": { "source": "010", "value": "AG-0042" }
  }
]
```

Sub-publisher (`SE`) — collection only:

```json
"territories": [
  {
    "territory": { "include": ["250"], "exclude": [] },
    "shareTypes": [
      {
        "type": "coll",
        "shares": [
          { "rightsType": "pr", "value": 50, "society": "058" }
        ]
      }
    ]
  }
]
```

***

## TIS codes

Territory codes follow the CISAC TIS standard. They apply to **`coll`** entries, not to **`own`** ownership rows.