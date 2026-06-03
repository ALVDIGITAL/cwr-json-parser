---
title: Sound Recordings
metadata:
  robots: index
content:
  excerpt: >-
    The `recordings` array contains commercial recordings of the work. Each
    entry is derived from one or more `REC` records in the source CWR file.
privacy:
  view: public
---
## Deduplication by ISRC

ISRC is used as the dedup key. Multiple `REC` records with the same ISRC are merged into a single recording entry with multiple releases in `releases[]`.

Records with no ISRC always create a new recording entry.

***

## Recording Object

| Field      | Type   | Req | Source Field         | Description                                               |
| ---------- | ------ | --- | -------------------- | --------------------------------------------------------- |
| `title`    | string | O   | `REC.RecordingTitle` | Title of the recording                                    |
| `version`  | string | O   | `REC.VersionTitle`   | Version or remix title                                    |
| `isrc`     | string | O   | `REC.ISRC`           | International Standard Recording Code. Used as dedup key. |
| `releases` | array  | O   | —                    | Commercial releases of this recording                     |

***

## Release Object

| Field         | Type   | Req | Source Field      | Description                     |
| ------------- | ------ | --- | ----------------- | ------------------------------- |
| `title`       | string | O   | `REC.AlbumTitle`  | Album or release title          |
| `label`       | string | O   | `REC.RecordLabel` | Record label name               |
| `releaseDate` | string | O   | `REC.ReleaseDate` | Format: `YYYYMMDD`              |
| `identifiers` | array  | O   | —                 | Release identifiers — see below |

### Release identifiers

| `source`          | CWR Source Field                      | Description      |
| ----------------- | ------------------------------------- | ---------------- |
| `"ean"`           | `REC.EAN` / `REC.Ean` / `REC.EanCode` | EAN barcode      |
| `"catalogNumber"` | `REC.ReleaseCatalogNumber`            | Catalogue number |

***

## Example

```json
"recordings": [
  {
    "title": "BOHEMIAN RHAPSODY",
    "isrc": "GB-EMI-75-00001",
    "releases": [
      {
        "title": "A NIGHT AT THE OPERA",
        "label": "EMI RECORDS",
        "releaseDate": "19751031",
        "identifiers": [
          { "source": "catalogNumber", "value": "EMTC-101" },
          { "source": "ean", "value": "5099996897027" }
        ]
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

Set when **all three** conditions are met on a `PWR` record:

1. `RelinquishmentIndicator = "Y"`
2. `PublisherIPNumber` resolves to a known publisher in `publishersByIp`

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
