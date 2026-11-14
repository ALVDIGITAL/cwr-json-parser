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
Territory entries appear in `parties[].territories[]` (v1.0). **Collection** shares are tied to TIS codes; **ownership** shares are not.

***

## Ownership vs collection (important)

| `shareTypes[].type` | CWR source records | TIS on `territory` |
| ------------------- | ------------------ | ------------------ |
| `"own"`             | `SWR`, `OWR`, `SPU`, `OPU` | **None** — always `include: []`, `exclude: []` |
| `"coll"`            | `SWT`, `OWT`, `SPT`, `OPT` | **Yes** — `include` / `exclude` from the territory record |

Converters must keep these in **separate** `territories[]` entries when both exist. Do not merge `own` into a collection row that carries TIS codes such as `2136` (World).

**Sub-publishers** (`SE`, `AM`, `PA`) carry only **`coll`** territories (from `SPT` / `OPT`). They must not carry `shareTypes[].type: "own"` in v1.0 — only **original publishers** (`role: "E"`) and **writers** carry ownership shares.

***

## Territory Entry Object

| Field               | Type      | Req | Description                                                                                                                                           |
| ------------------- | --------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `territory.include` | string\[] | M   | TIS Numeric Codes for **collection** scope. For an **`own`** entry, both `include` and `exclude` are `[]`. `["2136"]` = World when used for `coll`. |
| `territory.exclude` | string\[] | M   | TIS Numeric Codes excluded from **collection** scope. Use `[]` when nothing is excluded                                                              |
| `shareTypes`        | array     | M   | An entry with `"own"` must contain only that one share type (enforced by the schema). Converters should write one share type per entry             |
| `agreementNumber`   | object    | O   | Agreement number for this territory: `{ source?, value }`. From CWR: take `SubmitterAgreementNumber`, else `SocietyAssignedAgreementNumber`, from `SPU`/`OPU` (own entry and new collection entries of that publisher) or `SPT`/`OPT` (that entry). For `SPU`/`OPU`, `source` is the publisher's affiliation society; `SPT`/`OPT` have no society field, so `source` is omitted |

TIS codes may be copied as they appear in the EDI field (usually 4 digits, zero-padded, e.g. `"0276"`). The schema accepts both the padded and unpadded form (`"0276"` and `"276"`).

**Merging collection rows.** Converters should combine `SPT` / `OPT` / `SWT` / `OWT` rows for the same party when they carry the same non-zero share values: the TIS codes accumulate in one entry's `include` / `exclude`. A territory row with all shares `0` should add its TIS code to the party's most recent collection entry instead of creating an entry with no shares.

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
| `value`      | number | M   | Share as a decimal percentage (0–100). Raw CWR share field divided by 100, e.g. CWR `05000` → `50`. Shares with value `0` are omitted |
| `society`    | string | O   | Affiliation society code for this share (e.g., `"035"` = GEMA, `"052"` = PRS). Present on `own` shares from `SWR`/`OWR`/`SPU`/`OPU`; `coll` shares carry none because territory records have no society fields. Blank and `000` are omitted |

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
          { "rightsType": "pr", "value": 50 }
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
          { "rightsType": "pr", "value": 50 }
        ]
      }
    ]
  }
]
```

***

## TIS codes

Territory codes follow the CISAC TIS standard. They apply to **`coll`** entries, not to **`own`** ownership rows.