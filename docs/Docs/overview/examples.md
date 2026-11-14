---
appearance:
  table_of_contents: default
category:
  uri: Docs
parent:
  uri: overview
position: 1
privacy:
  view: public
slug: examples
title: Examples
---
# Examples

Each example below is the CWR-JSON for the CWR EDI shown above it. Each JSON block is a complete document: it parses as JSON and passes the published [JSON Schema](https://d7ap24707c.execute-api.eu-west-1.amazonaws.com/staging/api/v1/schemas/cwr-json-schema-v1.0.schema.json) and the semantic rules in strict mode. You can copy any block and validate it as is.

Example 4 adds sender-supplied fields, which are not mapped from CWR EDI. Trailing spaces in the EDI lines are trimmed here for readability.

The examples were produced with the [CWR-JSON Playground](https://cwr.alvdev.com/#/) (informative; the rules are in this specification, not in any tool).

---

## Example 1: NWR with ISWC and XRF cross-references

Source file `XRF-identifiers-sample.V22`:

```
HDR00000000001XRF SAMPLE PUBLISHER                         02.202026063012000020260630
GRHNWR0000102.20
NWR0000000100000000XRF IDENTIFIER DEMO WORK                                      SW00000000001 T0000000010                    POP      U      ORI
XRF00000001000000010353987389001    WY
XRF0000000100000002ISWT0000000010   WY
XRF0000000100000003ISRUSRC17607839  RY
XRF0000000100000004EMIEMI-00042     WY
XRF0000000100000005035SKIPPED-BAD   WN
XRF0000000100000006000SHOULD-SKIP   WY
```

CWR-JSON output:

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
        {
          "value": "XRF IDENTIFIER DEMO WORK",
          "type": "TT"
        }
      ],
      "identifiers": [
        {
          "iswc": [
            "T-000.000.001-0"
          ]
        },
        {
          "type": "submitterWorkId",
          "value": "SW00000000001",
          "source": {
            "type": "cwrSubmitter",
            "value": "00000000001",
            "name": "XRF SAMPLE PUBLISHER"
          }
        },
        {
          "type": "societyWorkId",
          "value": "3987389001",
          "source": {
            "type": "cisacSociety",
            "value": "035"
          }
        },
        {
          "type": "publisherWorkId",
          "value": "EMI-00042",
          "source": {
            "type": "cwrSubmitter",
            "value": "EMI"
          }
        },
        {
          "type": "societyWorkId",
          "value": "SKIPPED-BAD",
          "source": {
            "type": "cisacSociety",
            "value": "035"
          }
        }
      ],
      "parties": [],
      "recordings": [
        {
          "isrc": [
            "USRC17607839"
          ]
        }
      ]
    }
  ]
}
```

What to notice:

- `NWR` ISWC `T0000000010` and `XRF` org `ISW` are the same ISWC. It is stored once in `{ "iswc": [...] }`, in dotted form.
- `NWR.SubmitterWorkNumber` is `submitterWorkId`. Its `source` is the `HDR` sender (`cwrSubmitter`).
- `XRF` org `035` (a CISAC society) is `societyWorkId` / `cisacSociety`. Org `EMI` (2–3 letters) is `publisherWorkId` / `cwrSubmitter`.
- `XRF` validity `N` is still mapped (`SKIPPED-BAD`). Org `000` is skipped.
- `XRF` `R` ISRC `USRC17607839` matches no `REC`, so it becomes its own recording with only `isrc`.

---

## Example 2: REV with publisher chains and collection territories (CWR 2.2)

Source file `BC-key008.V22` (two original publishers share one sub-publisher):

```
HDRPB000000TSTCWR-JSON TEST FIXTURE                        01.102026010112000020260101               2.2001CWR-JSON PLAYGROUND           1.0
GRHREV0000102.200000000001
REV0000000000000000MULTIPLE ORIGINAL PUBLISHERS WITH THE SAME SUB-PUBLISHER      KEY008                   00000000            POP000000N      ORI   ORINON                                          N
SPU000000000000000101P00000001TEST PUBLISHING A                             E 00000000000900000007              052025000440500004405000 N
SPU000000000000000201P00000002TEST PUBLISHING B                             SE00000000000900000006              055000000550000005500000 N
SPT0000000000000003P00000002      025000500005000I2136N001
SPU000000000000000402P00000005TEST PUBLISHING F                             E 00000000000900000003              058025000580500005805000 N
SPU000000000000000502P00000002TEST PUBLISHING B                             SE00000000000900000006              055000000550000005500000 N
SPT0000000000000006P00000002      025000500005000I2136N001
SWR0000000000000007C00000001WRITER ONE                                   ALPHA                          CA         00900000012052025000520000005200000 N
SWT0000000000000008C00000001025000000000000I2136N001
PWR0000000000000009P00000001TEST PUBLISHING A                                                        C0000000101
SWR0000000000000010C00000005WRITER THREE                                 GAMMA                          CA         00900000009008025000080000000800000 N
SWT0000000000000011C00000005025000000000000I2136N001
PWR0000000000000012P00000005TEST PUBLISHING F                                                        C0000000502
GRT000010000000015
TRL0000100000000010000000017
```

CWR-JSON output:

```json
{
  "header": {
    "senderIdentifier": "PB000000TST",
    "senderName": "CWR-JSON TEST FIXTURE",
    "creationDate": "20260101",
    "creationTime": "120000",
    "version": "2.2",
    "softwarePackage": "CWR-JSON PLAYGROUND"
  },
  "works": [
    {
      "messages": {
        "type": "rev",
        "schema": "CWR-JSON Schema v1.0",
        "schemaDescription": "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits."
      },
      "flags": {},
      "titles": [
        {
          "value": "MULTIPLE ORIGINAL PUBLISHERS WITH THE SAME SUB-PUBLISHER",
          "type": "TT"
        }
      ],
      "identifiers": [
        {
          "type": "submitterWorkId",
          "value": "KEY008",
          "source": {
            "type": "cwrSubmitter",
            "value": "PB000000TST",
            "name": "CWR-JSON TEST FIXTURE"
          }
        }
      ],
      "parties": [
        {
          "role": "CA",
          "name": "ALPHA WRITER ONE",
          "ipi": "00900000012",
          "partyId": "C00000001",
          "controlled": "yes",
          "territories": [
            {
              "territory": {
                "include": [],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "own",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25,
                      "society": "052"
                    }
                  ]
                }
              ]
            },
            {
              "territory": {
                "include": [
                  "2136"
                ],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "coll",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25
                    }
                  ]
                }
              ]
            }
          ],
          "representedBy": [
            {
              "role": "E",
              "name": "TEST PUBLISHING A",
              "ipi": "00900000007",
              "partyId": "P00000001",
              "controlled": "yes",
              "territories": [
                {
                  "territory": {
                    "include": [],
                    "exclude": []
                  },
                  "shareTypes": [
                    {
                      "type": "own",
                      "shares": [
                        {
                          "rightsType": "pr",
                          "value": 25,
                          "society": "052"
                        },
                        {
                          "rightsType": "mr",
                          "value": 50,
                          "society": "052"
                        },
                        {
                          "rightsType": "sr",
                          "value": 50,
                          "society": "052"
                        }
                      ]
                    }
                  ]
                }
              ],
              "representedBy": [
                {
                  "role": "SE",
                  "name": "TEST PUBLISHING B",
                  "ipi": "00900000006",
                  "partyId": "P00000002",
                  "controlled": "yes",
                  "territories": [
                    {
                      "territory": {
                        "include": [
                          "2136"
                        ],
                        "exclude": []
                      },
                      "shareTypes": [
                        {
                          "type": "coll",
                          "shares": [
                            {
                              "rightsType": "pr",
                              "value": 25
                            },
                            {
                              "rightsType": "mr",
                              "value": 50
                            },
                            {
                              "rightsType": "sr",
                              "value": 50
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "representedBy": []
                }
              ]
            }
          ]
        },
        {
          "role": "CA",
          "name": "GAMMA WRITER THREE",
          "ipi": "00900000009",
          "partyId": "C00000005",
          "controlled": "yes",
          "territories": [
            {
              "territory": {
                "include": [],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "own",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25,
                      "society": "008"
                    }
                  ]
                }
              ]
            },
            {
              "territory": {
                "include": [
                  "2136"
                ],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "coll",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25
                    }
                  ]
                }
              ]
            }
          ],
          "representedBy": [
            {
              "role": "E",
              "name": "TEST PUBLISHING F",
              "ipi": "00900000003",
              "partyId": "P00000005",
              "controlled": "yes",
              "territories": [
                {
                  "territory": {
                    "include": [],
                    "exclude": []
                  },
                  "shareTypes": [
                    {
                      "type": "own",
                      "shares": [
                        {
                          "rightsType": "pr",
                          "value": 25,
                          "society": "058"
                        },
                        {
                          "rightsType": "mr",
                          "value": 50,
                          "society": "058"
                        },
                        {
                          "rightsType": "sr",
                          "value": 50,
                          "society": "058"
                        }
                      ]
                    }
                  ]
                }
              ],
              "representedBy": [
                {
                  "role": "SE",
                  "name": "TEST PUBLISHING B",
                  "ipi": "00900000006",
                  "partyId": "P00000002",
                  "controlled": "yes",
                  "territories": [],
                  "representedBy": []
                }
              ]
            }
          ]
        }
      ],
      "recordings": []
    }
  ]
}
```

What to notice:

- `own` shares (from `SWR` / `SPU`) sit in a `territories[]` entry with empty `include` / `exclude`. `coll` shares (from `SWT` / `SPT`) sit in a separate entry scoped to TIS `2136`.
- Writers are top-level `parties[]`. `PWR` links each writer to its original publisher (`E`) in `representedBy[]`. The sub-publisher (`SE`) is nested under the `E` it administers and has `coll` only.
- The same sub-publisher under a second `E` chain is kept, with an empty `territories[]` because its `SPT` was already merged.
- Share values of `0` are omitted, so a writer with only PR ownership shows only `pr`.
- Writer `name` is first name, then last name (`SWR` first name `ALPHA` + last name `WRITER ONE`).

---

## Example 3: ACK with an MSG row

Source: one transaction from the GEMA acknowledgement file `151708_CW260050035_MDW.V22`:

```
HDRSO000000035GEMA                                         01.102026071615090220260716
GRHACK0000102.200000000000
ACK0000004100000000202607161139540000100000041NWRLONG IN THE TOOTH                                           ALV003306748PW      0044171061001       20260716AC
NWR0000004100000001LONG IN THE TOOTH                                             ALV003306748PWT334420776300000000            UNC000000UMTX   ORI         S.SELZER@MELODIEDERWELT.DE    DE01000267  N00000000000
SPU000000410000000201706751   BJ SHAVER MUSIC                               E 00000000000357285142              021025000990500009900000 N
SPU000000410000000301579989   MELODIE DER WELT GMBH & CO KG                 SE00000000000645535338              035000000350000009900000 N                            35AGR004993455PG
SPT0000004100000004579989         025000500000000I2136 001
SWR0000004100000005622151   SHAVER                                       BILLY JOE                      CA         00056523187021025000990000009900000 N               000000000000
SWT0000004100000006622151   025000000000000I2136 001
PWR0000004100000007706751   BJ SHAVER MUSIC                                                          622151   01
MSG0000004100000008F00000008OWRF009WRITER CAE ENTERED NOT FOUND IN THE WRITER CAE TABLE
OWR0000004100000009721304   GLEASON                                      PAUL                           CA                    010050000990500009900000                 000000000000
PER0000004100000010BILLY JOE SHAVER
REC000000410000001100000000                                                            000000                                                                                                                                                            USLN61400222                                                                                                                                                                                                                                                     Y
```

CWR-JSON output:

```json
{
  "header": {
    "senderIdentifier": "SO000000035",
    "senderName": "GEMA",
    "creationDate": "20260716",
    "creationTime": "150902"
  },
  "works": [
    {
      "messages": {
        "type": "ack",
        "creationDate": "20260716",
        "creationTime": "113954",
        "originalGroupId": "00001",
        "originalTransactionSequence": "00000041",
        "originalTransactionType": "NWR",
        "creationTitle": "LONG IN THE TOOTH",
        "submitterCreationNumber": "ALV003306748PW",
        "recipientCreationNumber": "0044171061001",
        "processingDate": "20260716",
        "transactionStatus": "AC",
        "msgs": [
          {
            "status": "F",
            "message": "WRITER CAE ENTERED NOT FOUND IN THE WRITER CAE TABLE",
            "originalRecordSequence": "00000008",
            "recordType": "OWR",
            "messageLevel": "F",
            "validationNumber": "009"
          }
        ],
        "schema": "CWR-JSON Schema v1.0",
        "schemaDescription": "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits."
      },
      "flags": {},
      "titles": [
        {
          "value": "LONG IN THE TOOTH",
          "type": "TT"
        }
      ],
      "identifiers": [
        {
          "iswc": [
            "T-334.420.776-3"
          ]
        },
        {
          "type": "submitterWorkId",
          "value": "ALV003306748PW",
          "source": {
            "type": "cwrSubmitter",
            "value": "SO000000035",
            "name": "GEMA"
          }
        }
      ],
      "parties": [
        {
          "role": "CA",
          "name": "BILLY JOE SHAVER",
          "ipi": "00056523187",
          "partyId": "622151",
          "controlled": "yes",
          "territories": [
            {
              "territory": {
                "include": [],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "own",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25,
                      "society": "021"
                    }
                  ]
                }
              ]
            },
            {
              "territory": {
                "include": [
                  "2136"
                ],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "coll",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 25
                    }
                  ]
                }
              ]
            }
          ],
          "representedBy": [
            {
              "role": "E",
              "name": "BJ SHAVER MUSIC",
              "ipi": "00357285142",
              "partyId": "706751",
              "controlled": "yes",
              "territories": [
                {
                  "territory": {
                    "include": [],
                    "exclude": []
                  },
                  "shareTypes": [
                    {
                      "type": "own",
                      "shares": [
                        {
                          "rightsType": "pr",
                          "value": 25,
                          "society": "021"
                        },
                        {
                          "rightsType": "mr",
                          "value": 50,
                          "society": "021"
                        }
                      ]
                    }
                  ]
                }
              ],
              "representedBy": [
                {
                  "role": "SE",
                  "name": "MELODIE DER WELT GMBH & CO KG",
                  "ipi": "00645535338",
                  "partyId": "579989",
                  "controlled": "yes",
                  "territories": [
                    {
                      "territory": {
                        "include": [
                          "2136"
                        ],
                        "exclude": []
                      },
                      "shareTypes": [
                        {
                          "type": "coll",
                          "shares": [
                            {
                              "rightsType": "pr",
                              "value": 25
                            },
                            {
                              "rightsType": "mr",
                              "value": 50
                            }
                          ]
                        }
                      ],
                      "agreementNumber": {
                        "source": "035",
                        "value": "35AGR004993455"
                      }
                    }
                  ],
                  "representedBy": []
                }
              ]
            }
          ]
        },
        {
          "role": "CA",
          "name": "PAUL GLEASON",
          "partyId": "721304",
          "controlled": "no",
          "territories": [
            {
              "territory": {
                "include": [],
                "exclude": []
              },
              "shareTypes": [
                {
                  "type": "own",
                  "shares": [
                    {
                      "rightsType": "pr",
                      "value": 50,
                      "society": "010"
                    },
                    {
                      "rightsType": "mr",
                      "value": 50,
                      "society": "010"
                    }
                  ]
                }
              ]
            }
          ],
          "representedBy": []
        }
      ],
      "recordings": [
        {
          "isrc": [
            "USLN61400222"
          ],
          "releases": [
            {
              "releaseDate": "00000000"
            }
          ]
        }
      ]
    }
  ]
}
```

What to notice:

- The `ACK` row fills the flat ACK fields on `messages` (`type: "ack"`, `transactionStatus`, creation numbers, dates).
- The `MSG` row becomes `messages.msgs[]`.
- The nested `NWR` fills titles, identifiers, parties and recordings. The submitter work number `source` is the `HDR` sender of the ACK file (GEMA), not the original submitter.
- `REC` release date `00000000` (unknown) is kept as `releaseDate: "00000000"`.
- `PER` (performer) is not mapped.

> The `OWR` writer `PAUL GLEASON` has no IPI in the EDI, so `ipi` is omitted for that party. An empty optional field must be omitted; `"ipi": ""` fails the schema (`IPI_FORMAT`).

---

## Example 4: Sender-supplied conventions and tags

`header.conventions` and all `tags` are **not** mapped from CWR EDI. A sender adds them to the JSON file. This is Example 1 with those additions:

```json
{
  "header": {
    "senderIdentifier": "00000000001",
    "senderName": "XRF SAMPLE PUBLISHER",
    "creationDate": "20260630",
    "creationTime": "120000",
    "conventions": {
      "writerControl": "swrOnly",
      "publisherShare": "perWriterChain"
    },
    "tags": [
      {
        "name": "batch",
        "value": [
          "2026-06"
        ]
      }
    ]
  },
  "works": [
    {
      "messages": {
        "type": "nwr",
        "schema": "CWR-JSON Schema v1.0",
        "schemaDescription": "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits.",
        "tags": [
          {
            "name": "catalogue",
            "value": [
              "demo"
            ]
          }
        ]
      },
      "flags": {},
      "titles": [
        {
          "value": "XRF IDENTIFIER DEMO WORK",
          "type": "TT"
        }
      ],
      "identifiers": [
        {
          "iswc": [
            "T-000.000.001-0"
          ]
        },
        {
          "type": "submitterWorkId",
          "value": "SW00000000001",
          "source": {
            "type": "cwrSubmitter",
            "value": "00000000001",
            "name": "XRF SAMPLE PUBLISHER"
          }
        },
        {
          "type": "societyWorkId",
          "value": "3987389001",
          "source": {
            "type": "cisacSociety",
            "value": "035"
          }
        },
        {
          "type": "publisherWorkId",
          "value": "EMI-00042",
          "source": {
            "type": "cwrSubmitter",
            "value": "EMI"
          }
        },
        {
          "type": "societyWorkId",
          "value": "SKIPPED-BAD",
          "source": {
            "type": "cisacSociety",
            "value": "035"
          }
        }
      ],
      "parties": [],
      "recordings": [
        {
          "isrc": [
            "USRC17607839"
          ],
          "tags": [
            {
              "name": "mood",
              "value": [
                "happy",
                "fun"
              ]
            }
          ],
          "releases": [
            {
              "ean": [
                "5099996897027"
              ],
              "tags": [
                {
                  "name": "format",
                  "value": [
                    "cd"
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

- `conventions` is optional. When present, both `writerControl` and `publisherShare` are required. Omit `conventions` when the file mixes representations.
- `tags` are allowed on `header`, `works[].messages`, `recordings[]` and `recordings[].releases[]`. Each tag is a `name` plus a `value` array with at least one string.
