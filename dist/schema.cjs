"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/entries/schema.ts
var schema_exports = {};
__export(schema_exports, {
  getLookupDataTypes: () => getLookupDataTypes,
  getLookupSet: () => getLookupSet,
  getSchemaAsset: () => getSchemaAsset,
  hasTisCode: () => hasTisCode,
  isPublisherRole: () => isPublisherRole,
  isRoleCode: () => isRoleCode,
  isSubPublisherRole: () => isSubPublisherRole,
  isWriterRole: () => isWriterRole,
  schemaAssetMap: () => schemaAssetMap
});
module.exports = __toCommonJS(schema_exports);

// src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json
var cwr_json_schema_v1_0_schema_default = {
  $ref: "#/definitions/SchemaV1Output",
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    AgreementNumber: {
      additionalProperties: false,
      properties: {
        source: {
          type: "string"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "value"
      ],
      type: "object"
    },
    CanonicalParsedCwrFile: {
      $ref: "#/definitions/ParsedCwrFile"
    },
    CanonicalWork: {
      additionalProperties: false,
      properties: {
        flags: {
          $ref: "#/definitions/Flags"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        messages: {
          $ref: "#/definitions/Messages"
        },
        parties: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        rawRecords: {
          items: {
            type: "string"
          },
          type: "array"
        },
        recordings: {
          items: {
            $ref: "#/definitions/Recording"
          },
          type: "array"
        },
        titles: {
          items: {
            $ref: "#/definitions/WorkTitle"
          },
          type: "array"
        }
      },
      type: "object"
    },
    Flags: {
      additionalProperties: {},
      properties: {
        aiUsage: {
          $ref: "#/definitions/AiUsageIndicator"
        },
        anomalous: {
          type: "boolean"
        },
        fraudulent: {
          type: "boolean"
        }
      },
      type: "object"
    },
    HdrRecord: {
      additionalProperties: false,
      properties: {
        characterSet: {
          type: "string"
        },
        creationDate: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        creationTime: {
          type: "string",
          pattern: "^\\d{6}$"
        },
        revision: {
          type: "string"
        },
        senderIdentifier: {
          type: "string"
        },
        senderName: {
          type: "string"
        },
        softwarePackage: {
          type: "string"
        },
        softwarePackageVersion: {
          type: "string"
        },
        transmissionDate: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        version: {
          type: "string"
        }
      },
      type: "object"
    },
    Messages: {
      additionalProperties: {
        description: "Preview / society layers may add labels here; parser may add more fields over time"
      },
      properties: {
        changeRequest: {
          additionalProperties: {},
          type: "object"
        },
        msgs: {
          items: {
            additionalProperties: false,
            properties: {
              message: {
                type: "string"
              },
              status: {
                type: "string"
              }
            },
            type: "object"
          },
          type: "array"
        },
        relinquishment: {
          additionalProperties: false,
          properties: {
            indicator: {
              type: "string"
            }
          },
          required: [
            "indicator"
          ],
          type: "object"
        },
        revocation: {
          additionalProperties: false,
          properties: {
            indicator: {
              type: "string"
            },
            reason: {
              type: "string"
            }
          },
          required: [
            "indicator"
          ],
          type: "object"
        },
        schema: {
          type: "string"
        },
        schemaDescription: {
          type: "string"
        },
        societySpecific: {
          additionalProperties: {},
          type: "object"
        },
        type: {
          $ref: "#/definitions/MessageType"
        }
      },
      type: "object"
    },
    ParsedCwrFile: {
      additionalProperties: false,
      properties: {
        header: {
          $ref: "#/definitions/HdrRecord"
        },
        works: {
          items: {
            $ref: "#/definitions/CanonicalWork"
          },
          type: "array"
        }
      },
      required: [
        "works"
      ],
      type: "object"
    },
    Participant: {
      additionalProperties: false,
      properties: {
        agreementNumber: {
          $ref: "#/definitions/AgreementNumber"
        },
        controlled: {
          $ref: "#/definitions/ControlledFlag"
        },
        ipi: {
          type: "string",
          pattern: "^\\d{11}$"
        },
        name: {
          type: "string"
        },
        nameDomestic: {
          type: "string"
        },
        nameScript: {
          type: "string"
        },
        partyId: {
          type: "string"
        },
        relinquishment: {
          $ref: "#/definitions/Relinquishment"
        },
        representedBy: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        role: {
          $ref: "#/definitions/RoleCode"
        },
        roleName: {
          type: "string"
        },
        roleSplitM: {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        roleSplitT: {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        shares: {
          items: {
            $ref: "#/definitions/Share"
          },
          type: "array"
        },
        territories: {
          items: {
            $ref: "#/definitions/ParticipantTerritory"
          },
          type: "array"
        }
      },
      required: [
        "role"
      ],
      type: "object"
    },
    ParticipantTerritory: {
      additionalProperties: false,
      properties: {
        agreementNumber: {
          $ref: "#/definitions/AgreementNumber"
        },
        shareTypes: {
          items: {
            $ref: "#/definitions/TerritoryShareType"
          },
          type: "array"
        },
        territory: {
          additionalProperties: false,
          properties: {
            exclude: {
              type: "array",
              items: {
                $ref: "#/definitions/TisNumericCode"
              }
            },
            include: {
              type: "array",
              items: {
                $ref: "#/definitions/TisNumericCode"
              }
            }
          },
          required: [
            "include",
            "exclude"
          ],
          type: "object"
        }
      },
      required: [
        "territory",
        "shareTypes"
      ],
      type: "object",
      allOf: [
        {
          if: {
            properties: {
              shareTypes: {
                type: "array",
                contains: {
                  type: "object",
                  properties: {
                    type: {
                      const: "own"
                    }
                  },
                  required: [
                    "type"
                  ]
                }
              }
            }
          },
          then: {
            properties: {
              territory: {
                properties: {
                  include: {
                    maxItems: 0
                  },
                  exclude: {
                    maxItems: 0
                  }
                }
              },
              shareTypes: {
                maxItems: 1
              }
            }
          }
        }
      ]
    },
    Recording: {
      additionalProperties: false,
      properties: {
        isrc: {
          type: "string",
          pattern: "^[A-Z]{2}[A-Z0-9]{3}\\d{7}$"
        },
        releases: {
          items: {
            $ref: "#/definitions/RecordingRelease"
          },
          type: "array"
        },
        title: {
          type: "string"
        },
        version: {
          type: "string"
        }
      },
      type: "object"
    },
    RecordingRelease: {
      additionalProperties: false,
      properties: {
        catno: {
          type: "string"
        },
        ean: {
          type: "string",
          pattern: "^\\d{13}$"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        label: {
          type: "string"
        },
        releaseDate: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        title: {
          type: "string"
        }
      },
      type: "object"
    },
    Relinquishment: {
      additionalProperties: false,
      properties: {
        effectiveFrom: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        note: {
          type: "string"
        },
        postTermCollectionUntil: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        scope: {
          additionalProperties: false,
          properties: {
            rightsTypes: {
              items: {
                $ref: "#/definitions/RightsType"
              },
              type: "array"
            },
            territories: {
              additionalProperties: false,
              properties: {
                exclude: {
                  type: "array",
                  items: {
                    $ref: "#/definitions/TisNumericCode"
                  }
                },
                include: {
                  type: "array",
                  items: {
                    $ref: "#/definitions/TisNumericCode"
                  }
                }
              },
              required: [
                "include",
                "exclude"
              ],
              type: "object"
            }
          },
          required: [
            "rightsTypes",
            "territories"
          ],
          type: "object"
        }
      },
      required: [
        "effectiveFrom",
        "scope"
      ],
      type: "object"
    },
    RightsType: {
      type: "string",
      enum: [
        "pr",
        "mr",
        "sr"
      ]
    },
    RoleCode: {
      type: "string",
      enum: [
        "C",
        "A",
        "CA",
        "AR",
        "E",
        "SE",
        "AM",
        "PA",
        "AQ",
        "ES",
        "WR",
        "OP",
        "PRF"
      ]
    },
    SchemaV1Messages: {
      allOf: [
        {
          $ref: "#/definitions/Messages"
        },
        {
          additionalProperties: true,
          properties: {
            schema: {
              type: "string"
            },
            schemaDescription: {
              type: "string"
            }
          },
          required: [
            "schema",
            "schemaDescription"
          ],
          type: "object"
        }
      ]
    },
    SchemaV1Output: {
      additionalProperties: false,
      properties: {
        header: {
          $ref: "#/definitions/HdrRecord"
        },
        works: {
          items: {
            $ref: "#/definitions/SchemaV1WorkOutput"
          },
          type: "array"
        }
      },
      required: [
        "works"
      ],
      type: "object"
    },
    SchemaV1WorkOutput: {
      additionalProperties: false,
      properties: {
        flags: {
          $ref: "#/definitions/Flags"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        messages: {
          $ref: "#/definitions/SchemaV1Messages"
        },
        parties: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        recordings: {
          items: {
            $ref: "#/definitions/Recording"
          },
          type: "array"
        },
        titles: {
          items: {
            $ref: "#/definitions/WorkTitle"
          },
          type: "array"
        }
      },
      required: [
        "messages"
      ],
      type: "object"
    },
    Share: {
      additionalProperties: false,
      properties: {
        rightsType: {
          $ref: "#/definitions/RightsType"
        },
        society: {
          type: "string"
        },
        value: {
          type: "number",
          minimum: 0,
          maximum: 100
        }
      },
      required: [
        "rightsType",
        "value"
      ],
      type: "object"
    },
    TerritoryShareType: {
      additionalProperties: false,
      properties: {
        shares: {
          items: {
            $ref: "#/definitions/Share"
          },
          type: "array"
        },
        type: {
          enum: [
            "own",
            "coll"
          ],
          type: "string"
        }
      },
      required: [
        "type",
        "shares"
      ],
      type: "object"
    },
    WorkIdentifier: {
      additionalProperties: false,
      type: "object",
      required: [
        "source",
        "value"
      ],
      properties: {
        source: {
          $ref: "#/definitions/IdentifierSource"
        },
        value: {
          type: "string"
        }
      },
      allOf: [
        {
          if: {
            properties: {
              source: {
                const: "iswc"
              }
            },
            required: [
              "source"
            ]
          },
          then: {
            properties: {
              value: {
                type: "string",
                pattern: "^T-\\d{9}-\\d$"
              }
            }
          }
        },
        {
          if: {
            properties: {
              source: {
                const: "ean"
              }
            },
            required: [
              "source"
            ]
          },
          then: {
            properties: {
              value: {
                type: "string",
                pattern: "^\\d{13}$"
              }
            }
          }
        }
      ]
    },
    WorkTitle: {
      additionalProperties: false,
      properties: {
        language: {
          type: "string"
        },
        type: {
          $ref: "#/definitions/TitleTypeCode"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "value"
      ],
      type: "object"
    },
    TisNumericCode: {
      type: "string",
      enum: [
        "0004",
        "004",
        "4",
        "0008",
        "008",
        "8",
        "0012",
        "012",
        "12",
        "0020",
        "020",
        "20",
        "0024",
        "024",
        "24",
        "0028",
        "028",
        "28",
        "0031",
        "031",
        "31",
        "0032",
        "032",
        "32",
        "0036",
        "036",
        "36",
        "0040",
        "040",
        "40",
        "0044",
        "044",
        "44",
        "0048",
        "048",
        "48",
        "0050",
        "050",
        "50",
        "0051",
        "051",
        "51",
        "0052",
        "052",
        "52",
        "0056",
        "056",
        "56",
        "0064",
        "064",
        "64",
        "0068",
        "068",
        "68",
        "0070",
        "070",
        "70",
        "0072",
        "072",
        "72",
        "0076",
        "076",
        "76",
        "0084",
        "084",
        "84",
        "0090",
        "090",
        "90",
        "0096",
        "096",
        "96",
        "0100",
        "100",
        "0104",
        "104",
        "0108",
        "108",
        "0112",
        "112",
        "0116",
        "116",
        "0120",
        "120",
        "0124",
        "124",
        "0132",
        "132",
        "0140",
        "140",
        "0144",
        "144",
        "0148",
        "148",
        "0152",
        "152",
        "0156",
        "156",
        "0158",
        "158",
        "0170",
        "170",
        "0174",
        "174",
        "0178",
        "178",
        "0180",
        "180",
        "0188",
        "188",
        "0191",
        "191",
        "0192",
        "192",
        "0196",
        "196",
        "0203",
        "203",
        "0204",
        "204",
        "0208",
        "208",
        "0212",
        "212",
        "0214",
        "214",
        "0218",
        "218",
        "0222",
        "222",
        "0226",
        "226",
        "0231",
        "231",
        "0232",
        "232",
        "0233",
        "233",
        "0242",
        "242",
        "0246",
        "246",
        "0250",
        "250",
        "0258",
        "258",
        "0262",
        "262",
        "0266",
        "266",
        "0268",
        "268",
        "0270",
        "270",
        "0276",
        "276",
        "0288",
        "288",
        "0296",
        "296",
        "0300",
        "300",
        "0308",
        "308",
        "0320",
        "320",
        "0324",
        "324",
        "0328",
        "328",
        "0332",
        "332",
        "0336",
        "336",
        "0340",
        "340",
        "0344",
        "344",
        "0348",
        "348",
        "0352",
        "352",
        "0356",
        "356",
        "0360",
        "360",
        "0364",
        "364",
        "0368",
        "368",
        "0372",
        "372",
        "0376",
        "376",
        "0380",
        "380",
        "0384",
        "384",
        "0388",
        "388",
        "0392",
        "392",
        "0398",
        "398",
        "0400",
        "400",
        "0404",
        "404",
        "0408",
        "408",
        "0410",
        "410",
        "0414",
        "414",
        "0417",
        "417",
        "0418",
        "418",
        "0422",
        "422",
        "0426",
        "426",
        "0428",
        "428",
        "0430",
        "430",
        "0434",
        "434",
        "0438",
        "438",
        "0440",
        "440",
        "0442",
        "442",
        "0446",
        "446",
        "0450",
        "450",
        "0454",
        "454",
        "0458",
        "458",
        "0462",
        "462",
        "0466",
        "466",
        "0470",
        "470",
        "0478",
        "478",
        "0480",
        "480",
        "0484",
        "484",
        "0492",
        "492",
        "0496",
        "496",
        "0498",
        "498",
        "0499",
        "499",
        "0504",
        "504",
        "0508",
        "508",
        "0512",
        "512",
        "0516",
        "516",
        "0520",
        "520",
        "0524",
        "524",
        "0528",
        "528",
        "0540",
        "540",
        "0548",
        "548",
        "0554",
        "554",
        "0558",
        "558",
        "0562",
        "562",
        "0566",
        "566",
        "0578",
        "578",
        "0583",
        "583",
        "0584",
        "584",
        "0585",
        "585",
        "0586",
        "586",
        "0591",
        "591",
        "0598",
        "598",
        "0600",
        "600",
        "0604",
        "604",
        "0608",
        "608",
        "0616",
        "616",
        "0620",
        "620",
        "0624",
        "624",
        "0626",
        "626",
        "0630",
        "630",
        "0634",
        "634",
        "0642",
        "642",
        "0643",
        "643",
        "0646",
        "646",
        "0659",
        "659",
        "0662",
        "662",
        "0670",
        "670",
        "0674",
        "674",
        "0678",
        "678",
        "0682",
        "682",
        "0686",
        "686",
        "0688",
        "688",
        "0690",
        "690",
        "0694",
        "694",
        "0702",
        "702",
        "0703",
        "703",
        "0704",
        "704",
        "0705",
        "705",
        "0706",
        "706",
        "0710",
        "710",
        "0716",
        "716",
        "0724",
        "724",
        "0728",
        "728",
        "0729",
        "729",
        "0732",
        "732",
        "0740",
        "740",
        "0748",
        "748",
        "0752",
        "752",
        "0756",
        "756",
        "0760",
        "760",
        "0762",
        "762",
        "0764",
        "764",
        "0768",
        "768",
        "0776",
        "776",
        "0780",
        "780",
        "0784",
        "784",
        "0788",
        "788",
        "0792",
        "792",
        "0795",
        "795",
        "0798",
        "798",
        "0800",
        "800",
        "0804",
        "804",
        "0807",
        "807",
        "0818",
        "818",
        "0826",
        "826",
        "0834",
        "834",
        "0840",
        "840",
        "0854",
        "854",
        "0858",
        "858",
        "0860",
        "860",
        "0862",
        "862",
        "0882",
        "882",
        "0887",
        "887",
        "0894",
        "894",
        "2100",
        "2101",
        "2102",
        "2103",
        "2104",
        "2105",
        "2106",
        "2107",
        "2108",
        "2109",
        "2110",
        "2111",
        "2112",
        "2113",
        "2114",
        "2115",
        "2116",
        "2117",
        "2118",
        "2119",
        "2120",
        "2121",
        "2122",
        "2123",
        "2124",
        "2125",
        "2126",
        "2127",
        "2128",
        "2129",
        "2130",
        "2131",
        "2132",
        "2133",
        "2134",
        "2136"
      ]
    },
    ControlledFlag: {
      type: "string",
      enum: [
        "yes",
        "no"
      ]
    },
    TitleTypeCode: {
      type: "string",
      enum: [
        "TT",
        "ALT",
        "NAT",
        "AT",
        "FT",
        "IT",
        "OT",
        "PT",
        "RT",
        "TE",
        "UT"
      ]
    },
    IdentifierSource: {
      type: "string",
      enum: [
        "iswc",
        "submitterWorkNumber",
        "proprietary",
        "ean",
        "catalogNumber"
      ]
    },
    MessageType: {
      type: "string",
      enum: [
        "nwr",
        "rev"
      ]
    },
    AiUsageIndicator: {
      type: "string",
      enum: [
        "M",
        "T",
        "B",
        "N",
        "U",
        "Y"
      ]
    }
  }
};

// src/cwr-sdk/json-schemas/schemaAssetMap.ts
var schemaAssetMap = {
  "cwr-json-v1-0": cwr_json_schema_v1_0_schema_default
};
function getSchemaAsset(schemaId) {
  const schema = schemaAssetMap[schemaId];
  if (!schema) {
    throw new Error(`Missing generated schema asset for id: ${schemaId}`);
  }
  return schema;
}
__name(getSchemaAsset, "getSchemaAsset");

// src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json
var cwr_lookup_data_types_v1_0_r0_default = {
  $id: "cwr_lookup_data_types_v1.0_r0",
  version: "1.0.0",
  revision: "r0",
  source: "CISAC TIS database export (TIS.xlsx, sheet en, 241 territories)",
  generatedAt: "2026-06-03",
  tisEntryCount: 241,
  sets: {
    roleCodes: [
      "C",
      "A",
      "CA",
      "AR",
      "E",
      "SE",
      "AM",
      "PA",
      "AQ",
      "ES",
      "WR",
      "OP",
      "PRF"
    ],
    rightsTypes: [
      "pr",
      "mr",
      "sr"
    ],
    shareTypes: [
      "own",
      "coll"
    ],
    controlled: [
      "yes",
      "no"
    ],
    titleTypes: [
      "TT",
      "ALT",
      "NAT",
      "AT",
      "FT",
      "IT",
      "OT",
      "PT",
      "RT",
      "TE",
      "UT"
    ],
    identifierSources: [
      "iswc",
      "submitterWorkNumber",
      "proprietary",
      "ean",
      "catalogNumber"
    ],
    messageTypes: [
      "nwr",
      "rev"
    ],
    aiUsageIndicators: [
      "M",
      "T",
      "B",
      "N",
      "U",
      "Y"
    ],
    publisherRoles: [
      "E",
      "SE",
      "AM",
      "PA",
      "AQ",
      "ES",
      "OP"
    ],
    subPublisherRoles: [
      "SE",
      "AM",
      "PA"
    ],
    writerRoles: [
      "C",
      "A",
      "CA",
      "AR",
      "WR",
      "PRF"
    ],
    tisNumericCodes: [
      "0004",
      "004",
      "4",
      "0008",
      "008",
      "8",
      "0012",
      "012",
      "12",
      "0020",
      "020",
      "20",
      "0024",
      "024",
      "24",
      "0028",
      "028",
      "28",
      "0031",
      "031",
      "31",
      "0032",
      "032",
      "32",
      "0036",
      "036",
      "36",
      "0040",
      "040",
      "40",
      "0044",
      "044",
      "44",
      "0048",
      "048",
      "48",
      "0050",
      "050",
      "50",
      "0051",
      "051",
      "51",
      "0052",
      "052",
      "52",
      "0056",
      "056",
      "56",
      "0064",
      "064",
      "64",
      "0068",
      "068",
      "68",
      "0070",
      "070",
      "70",
      "0072",
      "072",
      "72",
      "0076",
      "076",
      "76",
      "0084",
      "084",
      "84",
      "0090",
      "090",
      "90",
      "0096",
      "096",
      "96",
      "0100",
      "100",
      "0104",
      "104",
      "0108",
      "108",
      "0112",
      "112",
      "0116",
      "116",
      "0120",
      "120",
      "0124",
      "124",
      "0132",
      "132",
      "0140",
      "140",
      "0144",
      "144",
      "0148",
      "148",
      "0152",
      "152",
      "0156",
      "156",
      "0158",
      "158",
      "0170",
      "170",
      "0174",
      "174",
      "0178",
      "178",
      "0180",
      "180",
      "0188",
      "188",
      "0191",
      "191",
      "0192",
      "192",
      "0196",
      "196",
      "0203",
      "203",
      "0204",
      "204",
      "0208",
      "208",
      "0212",
      "212",
      "0214",
      "214",
      "0218",
      "218",
      "0222",
      "222",
      "0226",
      "226",
      "0231",
      "231",
      "0232",
      "232",
      "0233",
      "233",
      "0242",
      "242",
      "0246",
      "246",
      "0250",
      "250",
      "0258",
      "258",
      "0262",
      "262",
      "0266",
      "266",
      "0268",
      "268",
      "0270",
      "270",
      "0276",
      "276",
      "0288",
      "288",
      "0296",
      "296",
      "0300",
      "300",
      "0308",
      "308",
      "0320",
      "320",
      "0324",
      "324",
      "0328",
      "328",
      "0332",
      "332",
      "0336",
      "336",
      "0340",
      "340",
      "0344",
      "344",
      "0348",
      "348",
      "0352",
      "352",
      "0356",
      "356",
      "0360",
      "360",
      "0364",
      "364",
      "0368",
      "368",
      "0372",
      "372",
      "0376",
      "376",
      "0380",
      "380",
      "0384",
      "384",
      "0388",
      "388",
      "0392",
      "392",
      "0398",
      "398",
      "0400",
      "400",
      "0404",
      "404",
      "0408",
      "408",
      "0410",
      "410",
      "0414",
      "414",
      "0417",
      "417",
      "0418",
      "418",
      "0422",
      "422",
      "0426",
      "426",
      "0428",
      "428",
      "0430",
      "430",
      "0434",
      "434",
      "0438",
      "438",
      "0440",
      "440",
      "0442",
      "442",
      "0446",
      "446",
      "0450",
      "450",
      "0454",
      "454",
      "0458",
      "458",
      "0462",
      "462",
      "0466",
      "466",
      "0470",
      "470",
      "0478",
      "478",
      "0480",
      "480",
      "0484",
      "484",
      "0492",
      "492",
      "0496",
      "496",
      "0498",
      "498",
      "0499",
      "499",
      "0504",
      "504",
      "0508",
      "508",
      "0512",
      "512",
      "0516",
      "516",
      "0520",
      "520",
      "0524",
      "524",
      "0528",
      "528",
      "0540",
      "540",
      "0548",
      "548",
      "0554",
      "554",
      "0558",
      "558",
      "0562",
      "562",
      "0566",
      "566",
      "0578",
      "578",
      "0583",
      "583",
      "0584",
      "584",
      "0585",
      "585",
      "0586",
      "586",
      "0591",
      "591",
      "0598",
      "598",
      "0600",
      "600",
      "0604",
      "604",
      "0608",
      "608",
      "0616",
      "616",
      "0620",
      "620",
      "0624",
      "624",
      "0626",
      "626",
      "0630",
      "630",
      "0634",
      "634",
      "0642",
      "642",
      "0643",
      "643",
      "0646",
      "646",
      "0659",
      "659",
      "0662",
      "662",
      "0670",
      "670",
      "0674",
      "674",
      "0678",
      "678",
      "0682",
      "682",
      "0686",
      "686",
      "0688",
      "688",
      "0690",
      "690",
      "0694",
      "694",
      "0702",
      "702",
      "0703",
      "703",
      "0704",
      "704",
      "0705",
      "705",
      "0706",
      "706",
      "0710",
      "710",
      "0716",
      "716",
      "0724",
      "724",
      "0728",
      "728",
      "0729",
      "729",
      "0732",
      "732",
      "0740",
      "740",
      "0748",
      "748",
      "0752",
      "752",
      "0756",
      "756",
      "0760",
      "760",
      "0762",
      "762",
      "0764",
      "764",
      "0768",
      "768",
      "0776",
      "776",
      "0780",
      "780",
      "0784",
      "784",
      "0788",
      "788",
      "0792",
      "792",
      "0795",
      "795",
      "0798",
      "798",
      "0800",
      "800",
      "0804",
      "804",
      "0807",
      "807",
      "0818",
      "818",
      "0826",
      "826",
      "0834",
      "834",
      "0840",
      "840",
      "0854",
      "854",
      "0858",
      "858",
      "0860",
      "860",
      "0862",
      "862",
      "0882",
      "882",
      "0887",
      "887",
      "0894",
      "894",
      "2100",
      "2101",
      "2102",
      "2103",
      "2104",
      "2105",
      "2106",
      "2107",
      "2108",
      "2109",
      "2110",
      "2111",
      "2112",
      "2113",
      "2114",
      "2115",
      "2116",
      "2117",
      "2118",
      "2119",
      "2120",
      "2121",
      "2122",
      "2123",
      "2124",
      "2125",
      "2126",
      "2127",
      "2128",
      "2129",
      "2130",
      "2131",
      "2132",
      "2133",
      "2134",
      "2136"
    ]
  }
};

// src/cwr-sdk/lookups/index.ts
var sets = cwr_lookup_data_types_v1_0_r0_default.sets;
var tisSet = new Set(sets.tisNumericCodes);
var roleSet = new Set(sets.roleCodes);
var publisherRoleSet = new Set(sets.publisherRoles);
var subPublisherRoleSet = new Set(sets.subPublisherRoles);
var writerRoleSet = new Set(sets.writerRoles);
function getLookupDataTypes() {
  return cwr_lookup_data_types_v1_0_r0_default;
}
__name(getLookupDataTypes, "getLookupDataTypes");
function getLookupSet(name) {
  return sets[name];
}
__name(getLookupSet, "getLookupSet");
function hasTisCode(code) {
  const trimmed = code.trim();
  if (tisSet.has(trimmed)) return true;
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return tisSet.has(String(n)) || tisSet.has(String(n).padStart(3, "0")) || tisSet.has(String(n).padStart(4, "0"));
  }
  return false;
}
__name(hasTisCode, "hasTisCode");
function isRoleCode(role) {
  return roleSet.has(role);
}
__name(isRoleCode, "isRoleCode");
function isPublisherRole(role) {
  return publisherRoleSet.has(role);
}
__name(isPublisherRole, "isPublisherRole");
function isSubPublisherRole(role) {
  return subPublisherRoleSet.has(role);
}
__name(isSubPublisherRole, "isSubPublisherRole");
function isWriterRole(role) {
  return writerRoleSet.has(role);
}
__name(isWriterRole, "isWriterRole");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLookupDataTypes,
  getLookupSet,
  getSchemaAsset,
  hasTisCode,
  isPublisherRole,
  isRoleCode,
  isSubPublisherRole,
  isWriterRole,
  schemaAssetMap
});
//# sourceMappingURL=schema.cjs.map