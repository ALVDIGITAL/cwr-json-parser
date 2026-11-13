---
appearance:
  table_of_contents: default
category:
  uri: Docs
content:
  excerpt: >-
    The `recordings` array contains commercial recordings of the work. Each
    entry is derived from one or more `REC` records in the source CWR file.
position: 5
privacy:
  view: public
slug: sound-recordings
title: Sound Recordings
---
## Deduplication by ISRC

A recording is the same recording when any stored ISRC matches the incoming `REC.ISRC`. Those rows merge into one entry with multiple releases. An `XRF` `R` ISRC that matches a stored ISRC is not copied again.

An `XRF` `R` ISRC that matches no recording becomes its own recording, `{ "isrc": ["GBEMI7500001"] }`, with no title or releases. Each unmatched code is a separate recording. An `XRF` `P` EAN that matches no release becomes its own recording, `{ "releases": [{ "ean": ["5099996897027"] }] }`, and is not attached to the other recordings. A later `REC` with the same ISRC fills the empty title and version on that shell.

***

## Recording Object

| Field      | Type   | Req | Source Field         | Description                                               |
| ---------- | ------ | --- | -------------------- | --------------------------------------------------------- |
| `title`       | string | O   | `REC.RecordingTitle` | Title of the recording |
| `version`     | string | O   | `REC.VersionTitle`   | Version or remix title |
| `isrc`        | string[] | O | `REC.ISRC`           | ISRC codes. Any match dedupes the recording. |
| `identifiers` | array  | O   | —                    | Asset ids only. Not produced from current EDI. |
| `tags`        | array  | O   | —                    | `{ name, value[] }`. Not mapped from CWR EDI. |
| `releases`    | array  | O   | —                    | Commercial releases of this recording |

***

## Release Object

| Field         | Type   | Req | Source Field      | Description                     |
| ------------- | ------ | --- | ----------------- | ------------------------------- |
| `title`       | string   | O   | `REC.AlbumTitle`           | Album or release title |
| `label`       | string   | O   | `REC.RecordLabel`          | Record label name |
| `releaseDate` | string   | O   | `REC.ReleaseDate`          | Format: `YYYYMMDD`. An unknown EDI date (`00000000`) is kept as `"00000000"` |
| `ean`         | string[] | O   | `REC.EAN` / `Ean` / `EanCode` / `EanNumber` | EAN barcodes |
| `catno`       | string   | O   | `REC.ReleaseCatalogNumber` | Catalogue number. Not an identifier triple. |
| `identifiers` | array    | O   | —                          | Other release ids. EAN is not copied here. |
| `tags`        | array    | O   | —                          | `{ name, value[] }`. Not mapped from CWR EDI. |

`tags[].name` is one label. `tags[].value` is a string array with at least one string.

***

## Example

```json
"recordings": [
  {
    "title": "BOHEMIAN RHAPSODY",
    "isrc": ["GBEMI7500001"],
    "tags": [{ "name": "mood", "value": ["happy", "fun"] }],
    "releases": [
      {
        "title": "A NIGHT AT THE OPERA",
        "label": "EMI RECORDS",
        "releaseDate": "19751031",
        "ean": ["5099996897027"],
        "catno": "EMTC-101"
      },
      {
        "title": "GREATEST HITS",
        "label": "PARLOPHONE",
        "releaseDate": "19811026"
      }
    ]
  }
]
```

***

# Relinquishment

The `relinquishment` object appears on a **publisher participant** when a `PWR` record signals that an original publisher (`E`) stops representing a writer for a specified scope. This is a CWR 2.2 Rev3 feature.

***

## Object Fields

| Field                       | Type      | Req | Source Field                      | Description                                                         |
| --------------------------- | --------- | --- | --------------------------------- | ------------------------------------------------------------------- |
| `effectiveFrom`             | string    | M   | `PWR.RelinquishmentEffectiveDate` | Date the relinquishment takes effect. Format: `YYYYMMDD`.           |
| `postTermCollectionUntil`   | string    | O   | `PWR.PostTermCollectionDate`      | If provided, collection is still permitted until this date.         |
| `scope.rightsTypes`         | string\[] | M   | `PWR.RelinquishmentPR/MR/SR`      | Rights relinquished: `["pr"]`, `["mr"]`, `["sr"]`, or combinations. |
| `scope.territories.include` | string\[] | M   | `PWR.RelinquishmentTerritoryCode` | TIS codes included (when `RelinquishmentTerritoryIndicator = "I"`)  |
| `scope.territories.exclude` | string\[] | M   | `PWR.RelinquishmentTerritoryCode` | TIS codes excluded (when `RelinquishmentTerritoryIndicator = "E"`)  |
| `note`                      | string    | O   | _(generated)_                     | Human-readable explanation                                          |

***

## Trigger condition

Set when **both** conditions are met on a `PWR` record:

1. `RelinquishmentIndicator = "Y"`
2. `PublisherIPNumber` is present and resolves to a publisher already registered in the same writer block (controlled `SPU` for `SWR`, other `OPU` for `OWR`), matched by publisher sequence and IP number

***

## Example

```json
{
  "role": "E",
  "name": "ORIGINAL PUBLISHER LTD",
  "ipi": "00000123456",
  "relinquishment": {
    "effectiveFrom": "20240101",
    "postTermCollectionUntil": "20241231",
    "scope": {
      "rightsTypes": ["pr", "mr"],
      "territories": {
        "include": ["840"],
        "exclude": []
      }
    },
    "note": "E publisher stops representing this writer for the specified scope."
  }
}
```

<br />