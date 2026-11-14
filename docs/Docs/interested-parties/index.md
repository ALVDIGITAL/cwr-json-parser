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
The `parties` array is the **ownership and collection view** of a work. It lists interested parties — writers at the top level, with original publishers and sub-publishers nested via `representedBy`. **Ownership** (`own`) and **collection** (`coll`) shares both use `territories[]`, but only **collection** is tied to TIS codes; see [Territories & Shares](/docs/territories-shares#ownership-vs-collection-important).

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
| `role`            | string | M   | Role code — see [Role Codes](/docs/role-codes-rights-title-types#role-codes)                           |
| `roleName`        | string | O   | Reserved. Allowed by the schema but has no CWR EDI source in format `1.0.1`. Converters should omit it |
| `name`            | string | O   | Party name. Writers: `WriterFirstName` + space + `WriterLastName` (e.g. `"BILLY JOE SHAVER"`). Publishers: `PublisherName` |
| `ipi`             | string | O   | IPI Name Number, exactly 11 digits. From CWR: `SWR`/`OWR.IPINameNumber` or `SPU`/`OPU.IPInameNumber`. Omit `ipi` when the CWR field is blank; do not write `""` or an IPI Base Number |
| `partyId`         | string | O   | Interested Party Number from the source CWR record                                                 |
| `controlled`      | string | O   | `"yes"` if submitter-controlled (SPU/SWR/SPT/SWT); `"no"` otherwise                                |
| `nameDomestic`    | string | O   | Non-Roman alphabet name from `NWN` / `NOW` / `NPN` records                                         |
| `nameScript`      | string | O   | Language/script code for `nameDomestic` (e.g., `"JA"`, `"ZH"`, `"KO"`)                             |
| `territories`     | array  | O   | Share breakdown — `own` without TIS scope; `coll` per TIS — [Territories & Shares](/docs/territories-shares) |
| `representedBy`   | array  | O   | Publishers/sub-publishers in the ownership chain — same Participant structure                      |
| `roleSplitM`      | number | O   | GEMA GW: composer percentage (0–100). Only on `CA` writers.                                        |
| `roleSplitT`      | number | O   | GEMA GW: lyricist/author percentage (0–100). Only on `CA` writers.                                 |
| `relinquishment`  | object | O   | CWR 2.2 Rev3 relinquishment from `PWR` — see [Sound Recordings](/docs/sound-recordings#relinquishment) |
| `agreementNumber` | object | O   | Reserved at party level. Allowed by the schema but has no CWR EDI source in format `1.0.1`. Converters should omit it and write agreement numbers on `territories[]` entries (see [Territories & Shares](/docs/territories-shares)) |
| `shares`          | array  | O   | Reserved. Allowed by the schema but has no CWR EDI source in format `1.0.1`. Converters should omit it and write shares under `territories[].shareTypes[]` |

***

## Publisher nesting rules

Converters must place publishers inside `representedBy[]` chains. The only publishers allowed at the top level of `parties[]` are original publishers (`E`) that no `PWR` links to a writer.

| CWR role                 | Position                                     |
| ------------------------ | -------------------------------------------- |
| `E` (Original Publisher) | Inside the writer's `representedBy[]` when a `PWR` links them; otherwise at the top level of `parties[]` |
| `SE` / `AM` / `PA`       | Inside the `representedBy[]` of the preceding `E` in the same `SPU` / `OPU` block |

**Building chains from `SPU` / `OPU` records:**

- `PublisherType = E` starts a new publisher chain.
- `PublisherType` `SE`, `AM` or `PA` goes into the `representedBy[]` of the current chain's `E`. Add the same sub-publisher (same Interested Party Number) only once per chain.
- `SPU` and `OPU` chains are separate: an `SE` / `AM` / `PA` in an `OPU` block attaches only to an `E` in that block.

**`PWR` records** link a writer to a publisher chain by `PublisherSequenceNumber` and `PublisherIPNumber`. Put the linked `E` (with its sub-publishers) in that writer's `representedBy[]`. Resolve `SWR` writers against `SPU` chains and `OWR` writers against `OPU` chains.

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
    "name": "FREDDIE MERCURY",
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
                      { "rightsType": "pr", "value": 50.00 }
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