---
appearance:
  table_of_contents: default
category:
  uri: Docs
position: 4
privacy:
  view: public
slug: interested-parties
title: Interested Parties
---
---
title: Interested Parties
metadata:
  robots: index
privacy:
  view: public
---
The `parties` array is the **ownership and collection view** of a work. It lists interested parties — writers at the top level, with original publishers and sub-publishers nested via `representedBy`. **Ownership** (`own`) and **collection** (`coll`) shares both use `territories[]`, but only **collection** is tied to TIS codes; see [Territories & Shares](./territories-shares#ownership-vs-collection-important).

***

## Structure

```
parties[]
  Writer (SWR / OWR)
  ├── role, name, ipi, partyId, controlled
  ├── nameDomestic, nameScript         ← from NWN/NOW records
  ├── roleSplitM, roleSplitT           ← GEMA GW (CA writers only)
  ├── territories[]                    ← own (no TIS) + coll (TIS-scoped) entries
  └── representedBy[]
        Original Publisher (role = E)
        ├── role, name, ipi, ...
        ├── relinquishment             ← CWR 2.2 Rev3 (PWR)
        ├── territories[]
        └── representedBy[]
              Sub-Publisher (role = SE / AM / PA)
              ├── role, name, ipi, ...
              └── territories[]
```

***

## Parties Object

Used throughout `parties[]` and inside `representedBy[]`.

| Field             | Type   | Req | Description                                                                                        |
| ----------------- | ------ | --- | -------------------------------------------------------------------------------------------------- |
| `role`            | string | M   | Role code — see [Role Codes](./role-codes-rights-title-types#role-codes)                           |
| `roleName`        | string | O   | Human-readable role name                                                                           |
| `name`            | string | O   | Legal name of the party (writers: `WriterLastName` + space + `WriterFirstName`)                    |
| `ipi`             | string | O   | IPI Name Number or IPI Base Number (11-digit string)                                               |
| `partyId`         | string | O   | Interested Party Number from the source CWR record                                                 |
| `controlled`      | string | O   | `"yes"` if submitter-controlled (SPU/SWR/SPT/SWT); `"no"` otherwise                                |
| `nameDomestic`    | string | O   | Non-Roman alphabet name from `NWN` / `NOW` / `NPN` records                                         |
| `nameScript`      | string | O   | Language/script code for `nameDomestic` (e.g., `"JA"`, `"ZH"`, `"KO"`)                             |
| `territories`     | array  | O   | Share breakdown — `own` without TIS scope; `coll` per TIS — [Territories & Shares](./territories-shares) |
| `representedBy`   | array  | O   | Publishers/sub-publishers in the ownership chain — same Participant structure                      |
| `roleSplitM`      | number | O   | GEMA GW: composer percentage (0–100). Only on `CA` writers.                                        |
| `roleSplitT`      | number | O   | GEMA GW: lyricist/author percentage (0–100). Only on `CA` writers.                                 |
| `relinquishment`  | object | O   | CWR 2.2 Rev3 relinquishment from `PWR` — see [Sound Recordings](./sound-recordings#relinquishment) |
| `agreementNumber` | object | O   | `{ source?, value }` — agreement number, typically for sub-publishers                              |

***

## Publisher nesting rules

Publishers appear inside `representedBy[]` chains — not at the top level of `parties`.

| CWR role                 | Position                                     |
| ------------------------ | -------------------------------------------- |
| `E` (Original Publisher) | Inside writer's `representedBy[]`            |
| `SE` / `AM` / `PA`       | Inside the `E` publisher's `representedBy[]` |
| `AM` / `PA`              | Can also be an independent party at the top of the `parties[]` node |

**Assignment logic from&#x20;**`SPU`**&#x20;/&#x20;**`OPU`**&#x20;records:**

- `PublisherType = E` → sets `lastEPublisher`; `lastSubPublisher` is reset
- `PublisherType ∈ {SE, AM, PA}` → appended to `lastEPublisher.representedBy[]`; sets `lastSubPublisher`

`PWR`**&#x20;records** link a writer (`WriterIPNumber`) to a publisher (`PublisherIPNumber`) via the writer's `representedBy[]`.

***

## Ownership vs collection territories

| Party | `own` in `territories[]` | `coll` in `territories[]` |
| ----- | ------------------------ | ------------------------- |
| Writer (`SWR`/`OWR`) | Yes — `territory.include` / `exclude` are `[]` | Yes — TIS from `SWT`/`OWT` |
| Original publisher (`E`) | Yes — empty TIS scope | Yes — TIS from `SPT`/`OPT` (if present) |
| Sub-publisher (`SE`/`AM`/`PA`) | **No** | Yes — TIS from `SPT`/`OPT` (if present) |

There is **no** default World (`2136`) row for ownership. If there are no `SPT`/`OPT`/`SWT`/`OWT` records, a party may have only an **`own`** entry with empty TIS arrays.

***

## Example

```json
"parties": [
  {
    "role": "C",
    "name": "MERCURY FREDDIE",
    "ipi": "00000000250",
    "partyId": "00000000250",
    "controlled": "yes",
    "territories": [
      {
        "territory": { "include": [], "exclude": [] },
        "shareTypes": [
          {
            "type": "own",
            "shares": [
              { "rightsType": "pr", "value": 50.00, "society": "021" },
              { "rightsType": "mr", "value": 50.00, "society": "044" }
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
              { "rightsType": "pr", "value": 50.00 },
              { "rightsType": "mr", "value": 50.00 }
            ]
          }
        ]
      }
    ],
    "representedBy": [
      {
        "role": "E",
        "name": "EMI MUSIC PUBLISHING LTD",
        "ipi": "00000223437",
        "controlled": "yes",
        "territories": [
          {
            "territory": { "include": [], "exclude": [] },
            "shareTypes": [
              {
                "type": "own",
                "shares": [
                  { "rightsType": "pr", "value": 50.00, "society": "052" }
                ]
              }
            ]
          }
        ],
        "representedBy": [
          {
            "role": "SE",
            "name": "WARNER CHAPPELL MUSIC FRANCE",
            "ipi": "00000285606",
            "controlled": "no",
            "territories": [
              {
                "territory": { "include": ["250"], "exclude": [] },
                "shareTypes": [
                  {
                    "type": "coll",
                    "shares": [
                      { "rightsType": "pr", "value": 50.00, "society": "058" }
                    ]
                  }
                ],
                "agreementNumber": { "source": "058", "value": "FR-9999" }
              }
            ]
          }
        ]
      }
    ]
  }
]
```

<br />