---
appearance:
  table_of_contents: default
category:
  uri: Docs
parent:
  uri: work-metadata
position: 0
privacy:
  view: public
slug: titles-identifiers-messages-flags
title: Titles, Identifiers, Messages, Flags
---
# Titles

The `titles` array contains all title entries for the work. Each element comes from one of three CWR record types.

## Fields

| Field      | Type   | Req | Description                                                                          |
| ---------- | ------ | --- | ------------------------------------------------------------------------------------ |
| `value`    | string | M   | The title text                                                                       |
| `type`     | string | O   | CWR title type code — see [Title Types](/docs/role-codes-rights-title-types#title-types) |
| `language` | string | O   | ISO language code (e.g., `"JA"`, `"ZH"`, `"KO"`). Present on `NAT` titles only.      |

## Sources

| CWR Record    | `type` value | Notes                                        |
| ------------- | ------------ | -------------------------------------------- |
| `NWR` / `REV` | `"TT"`       | The main registration title                  |
| `ALT`         | `"ALT"`      | Alternate title                              |
| `NAT`         | `"NAT"`      | Non-Roman alphabet title; carries `language` |

**Deduplication:** `{value, type}` pairs that appear more than once are collapsed to a single entry.

## Example

```json
"titles": [
  { "value": "BOHEMIAN RHAPSODY", "type": "TT" },
  { "value": "BOHEMIAN RHAP", "type": "ALT" },
  { "value": "ボヘミアン・ラプソディ", "type": "NAT", "language": "JA" }
]
```

***

# Identifiers

`identifiers[]` holds namespaced work ids and one ISWC entry. An ISWC entry is `{ "iswc": ["T-034.524.680-1"] }`. It is not a `{ type, value, source }` triple. `NWR` / `REV` `ISWC` and `XRF` org `ISW` with `IdentifierType` `W` append to that one array.

Parser output writes every recognized ISWC as dotted ISO `T-NNN.NNN.NNN-C`. The schema also accepts compact `TNNNNNNNNNC` and intermediate `T-NNNNNNNNN-C`.

Namespaced rows are `type`, then `value`, then optional `source`. Match on `source.type` and `source.value`. `source.name` is optional.

| Field | Type | Req | Description |
| --- | --- | --- | --- |
| `type` | string | M | `publisherWorkId`, `societyWorkId`, `submitterWorkId`, `assetId`, or `proprietary` |
| `value` | string | M | The identifier |
| `source` | object | O | Who assigned it. Omitted for `proprietary` |
| `source.type` | string | M | `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid` |
| `source.value` | string | M | The assigner id |
| `source.name` | string | O | Display name |

### EDI mapping

| CWR source | `type` | `source` |
| --- | --- | --- |
| `NWR.SubmitterWorkNumber` | `submitterWorkId` | `cwrSubmitter`, value from `HDR` sender id, name from sender name |
| `XRF` `W` + numeric society code (e.g. `035`) | `societyWorkId` | `cisacSociety`, value is the org code |
| `XRF` `W` + 2–3 letter code (e.g. `EMI`) | `publisherWorkId` | `cwrSubmitter`, value is the org code |
| `XRF` `W` with no org, or any other org | `proprietary` | omitted |
| `XRF` org `000` or `099` | _(skipped)_ | — |
| `XRF` `W` + org `ISW` | — | appended to the `{ iswc: string[] }` entry |
| `XRF` `R` + valid ISRC | — | `recordings[].isrc` when it already matches, otherwise its own `{ isrc: [code] }` shell |
| `XRF` `P` + 13-digit EAN | — | its own recording `{ releases: [{ ean: [code] }] }` |
| `XRF` `V` | _(skipped)_ | video / asset ids are not mapped yet |

All `Validity` values (`Y`, `N`, `U`) are emitted. The same ISWC from `NWR` and `XRF` `ISW` is stored once. Triples match on `type`, `value`, `source.type`, and `source.value`.

Recordings may carry `identifiers[]` when an asset id is present. Current EDI does not produce asset ids. The schema allows `{ "type": "assetId", "source": { "type": "dpid", "value": "..." } }`.

## Example

```json
"identifiers": [
  { "iswc": ["T-034.524.680-1"] },
  {
    "type": "submitterWorkId",
    "value": "SW00000000001",
    "source": { "type": "cwrSubmitter", "value": "00000000001", "name": "TEST PUBLISHER" }
  },
  {
    "type": "societyWorkId",
    "value": "3987389001",
    "source": { "type": "cisacSociety", "value": "035" }
  },
  {
    "type": "publisherWorkId",
    "value": "EMI-00042",
    "source": { "type": "cwrSubmitter", "value": "EMI" }
  }
]
```

***

# Messages

The `messages` object carries registration metadata, status flags, and ACK message content.

## Fields

| Field                      | Type   | Req | Source                        | Description                                     |
| -------------------------- | ------ | --- | ----------------------------- | ----------------------------------------------- |
| `type`                     | string | O   | `NWR` / `REV` / `ACK`         | `"nwr"`, `"rev"`, or `"ack"` (lowercased)       |
| `revocation`               | object | O   | `NWR.RevocationIndicator`     | Present if the work was flagged for revocation  |
| `revocation.indicator`     | string | M   | `NWR.RevocationIndicator`     | Raw indicator value                             |
| `revocation.reason`        | string | O   | `NWR.RevocationReason`        | CISAC Revocation Reason code: `NE` non-existing work, `NM` non-musical work, `NC` existing work not claimed by sender, `AN` anomalous work |
| `relinquishment`           | object | O   | `NWR.RelinquishmentIndicator` | Present if a relinquishment indicator appears   |
| `relinquishment.indicator` | string | M   | `NWR.RelinquishmentIndicator` | Raw indicator value                             |
| `creationDate`             | string | O   | `ACK.CreationDate`            | Original file creation date (ACK)               |
| `creationTime`             | string | O   | `ACK.CreationTime`            | Original file creation time (ACK)               |
| `originalGroupId`          | string | O   | `ACK.OriginalGroupId`         | Original GRH group id (ACK)                     |
| `originalTransactionSequence` | string | O | `ACK.OriginalTransactionSeq` | Original transaction sequence (ACK)          |
| `originalTransactionType`  | string | O   | `ACK.OriginalTransactionType` | e.g. `NWR` / `REV` (ACK)                        |
| `creationTitle`            | string | O   | `ACK.CreationTitle`           | Title as submitted (ACK)                        |
| `submitterCreationNumber`  | string | O   | `ACK.SubmitterCreationNumber` | Submitter work id (ACK)                         |
| `recipientCreationNumber`  | string | O   | `ACK.RecipientCreationNumber` | Recipient work id (ACK)                         |
| `processingDate`           | string | O   | `ACK.ProcessingDate`          | Date recipient processed the transaction        |
| `transactionStatus`        | string | O   | `ACK.TransactionStatus`       | Status code (`RA`, `AS`, `AC`, `RJ`, …)         |
| `msgs`                     | array  | O   | `MSG` records                 | ACK validation messages (see below)             |
| `schema`                   | string | M   | _(injected by schemaV1)_      | Schema label used for this output               |
| `schemaDescription`        | string | M   | _(injected by schemaV1)_      | Schema description                              |
| `societySpecific`          | object | O   | _(reserved)_                  | Reserved for society-specific extension data    |
| `tags`                     | array  | O   | —                             | `{ name, value[] }`. Not mapped from CWR EDI. Set on the JSON file. |

### `msgs[]` items

| Field                     | Type   | Source                        | Description |
| ------------------------- | ------ | ----------------------------- | ----------- |
| `status`                  | string | `MSG.MessageType`             | Severity: `F`/`R`/`T`/`G`/`E` |
| `message`                 | string | `MSG.MessageText`             | Message text |
| `originalRecordSequence`  | string | `MSG.OriginalRecordSequence`  | Record seq that caused the message |
| `recordType`              | string | `MSG.MessageRecordType`       | Record type that caused the message |
| `messageLevel`            | string | `MSG.MessageLevel`            | Edit level: `F`/`R`/`T`/`G`/`E` |
| `validationNumber`        | string | `MSG.ValidationNumber`        | Spec validation number |

`tags[].name` is one label. `tags[].value` is a string array with at least one string. The same object is used on `header.tags`. A work-level example:

```json
"messages": {
  "type": "nwr",
  "tags": [{ "name": "custom", "value": ["example"] }]
}
```

## Example (NWR)

```json
"messages": {
  "type": "nwr",
  "revocation": {
    "indicator": "Y",
    "reason": "NE"
  }
}
```

## Example (ACK)

```json
"messages": {
  "type": "ack",
  "creationDate": "20260716",
  "creationTime": "113954",
  "originalGroupId": "00001",
  "originalTransactionSequence": "00000000",
  "originalTransactionType": "NWR",
  "creationTitle": "(WE ARE) THE COWBOYS",
  "submitterCreationNumber": "ALV003306733PW",
  "recipientCreationNumber": "0044170896001",
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
  ]
}
```

***

# Flags

The `flags` object holds boolean and indicator fields extracted from the `NWR` / `REV` record.

## Fields

| Field             | Type    | Req | Source Field                 | Description                                                                         |
| ----------------- | ------- | --- | ---------------------------- | ----------------------------------------------------------------------------------- |
| `anomalous`       | boolean | O   | `NWR.AnomalousWorkIndicator` | `true` if the work is marked anomalous (`"Y"` → `true`)                             |
| `anomalousReason` | string  | O   | `NWR.AnomalousWorkReason`    | CISAC Anomalous Work Reason code: `IPS` inaccurate IPs, `UNA` unauthorised version   |
| `aiUsage`         | string  | O   | `NWR.AIIndicator`            | AI indicator from the CISAC CWR 2.2 Rev. 3 lookup: `"M"` (music), `"T"` (text), `"A"` (all: music and text). Raw EDI value is copied. |
| `fraudulent`      | boolean | O   | _(reserved)_                 | Reserved for future use                                                             |

> Senders should use only `M`, `T` or `A` for `aiUsage`. The published schema `1.0.1` also accepts `B`, `N`, `U` and `Y`, which are not in the CISAC lookup. Removing them is under review by the CWR-JSON subgroup.

## Example

```json
"flags": {
  "anomalous": true,
  "anomalousReason": "IPS",
  "aiUsage": "M"
}
```