---
title: Examples
slug: example-simple-nwr
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: 'A minimal single-writer, single-publisher work registration.'
---

# Example: Simple NWR

A minimal work registration: one controlled writer (composer), one original publisher, world territory, performing and mechanical rights.

---

## Source CWR (abbreviated)

```
HDR  EMI  EMI MUSIC PUBLISHING LTD  20260101  120000
NWR  BOHEMIAN RHAPSODY              T-000.000.001-0  EMI-00042
SPU  00000223437  EMI MUSIC PUBLISHING LTD  E  005000  005000  000000
SWR  00000000250  MERCURY  FREDDIE  C  005000  005000  000000
PWR  00000000250  00000223437
SPT  00000223437  I  2136  005000  005000  000000
SWT  00000000250  I  2136  005000  005000  000000
REC  GB-EMI-75-00001  BOHEMIAN RHAPSODY    A NIGHT AT THE OPERA  EMI RECORDS  19751031
```

---

## CWR-JSON output

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
      "identifiers": [
        { "iswc": ["T-000.000.001-0"] },
        {
          "type": "submitterWorkId",
          "value": "EMI-00042",
          "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "EMI" }
        }
      ],
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
                    { "rightsType": "pr", "value": 50.00 },
                    { "rightsType": "mr", "value": 50.00 }
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
                        { "rightsType": "pr", "value": 50.00 },
                        { "rightsType": "mr", "value": 50.00 }
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
              ]
            }
          ]
        }
      ],
      "recordings": [
        {
          "title": "BOHEMIAN RHAPSODY",
          "isrc": ["GBEMI7500001"],
          "releases": [
            {
              "title": "A NIGHT AT THE OPERA",
              "label": "EMI RECORDS",
              "releaseDate": "19751031"
            }
          ]
        }
      ]
    }
  ]
}
```

Ownership (`own`) uses `territory.include: []` / `exclude: []`. Collection (`coll`) from `SWT` / `SPT` uses TIS codes on a separate `territories[]` entry.
