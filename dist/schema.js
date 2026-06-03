var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

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
          type: "string"
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
          type: "string"
        },
        creationTime: {
          type: "string"
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
          type: "string"
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
          type: "string"
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
          enum: [
            "yes",
            "no"
          ],
          type: "string"
        },
        ipi: {
          type: "string"
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
          type: "number"
        },
        roleSplitT: {
          type: "number"
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
              items: {
                type: "string"
              },
              type: "array"
            },
            include: {
              items: {
                type: "string"
              },
              type: "array"
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
      type: "object"
    },
    Recording: {
      additionalProperties: false,
      properties: {
        isrc: {
          type: "string"
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
          type: "string"
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
          type: "string"
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
          type: "string"
        },
        note: {
          type: "string"
        },
        postTermCollectionUntil: {
          type: "string"
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
                  items: {
                    type: "string"
                  },
                  type: "array"
                },
                include: {
                  items: {
                    type: "string"
                  },
                  type: "array"
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
      enum: [
        "pr",
        "mr",
        "sr"
      ],
      type: "string"
    },
    RoleCode: {
      type: "string"
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
          type: "number"
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
      properties: {
        source: {
          type: "string"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "source",
        "value"
      ],
      type: "object"
    },
    WorkTitle: {
      additionalProperties: false,
      properties: {
        language: {
          type: "string"
        },
        type: {
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
export {
  getSchemaAsset,
  schemaAssetMap
};
//# sourceMappingURL=schema.js.map