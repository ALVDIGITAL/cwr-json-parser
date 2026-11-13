---
appearance:
  table_of_contents: default
category:
  uri: Docs
parent:
  uri: interested-parties
position: 1
privacy:
  view: public
slug: role-codes-rights-title-types
title: Role Codes, Rights & Title types
---

# Role Codes

Used in `parties[].role`.

| Code | Description | Typical party |
|---|---|---|
| `C` | Composer | Writer |
| `A` | Author / Lyricist | Writer |
| `CA` | Composer-Author (music + text) | Writer |
| `AR` | Arranger | Writer |
| `E` | Original Publisher | Publisher |
| `SE` | Sub-Publisher | Publisher |
| `AM` | Administrator | Publisher |
| `PA` | Income Participant | Publisher |
| `AQ` | Acquirer | Publisher |
| `ES` | Publisher (society) | Publisher |
| `WR` | Writer (generic) | Writer |
| `OP` | Other Publisher (generic) | Publisher |
| `PRF` | Performing Artist | Recording context |

---

# Rights Types

Used in `shares[].rightsType`.

| Code | Description |
|---|---|
| `pr` | Performing Rights |
| `mr` | Mechanical Rights |
| `sr` | Synchronisation Rights |

---

# Title Types

Used in `titles[].type`.

| Code | Description | CWR Source Record |
|---|---|---|
| `TT` | Original / Main Title | `NWR` / `REV` |
| `ALT` | Alternate Title | `ALT` |
| `NAT` | Non-Roman Alphabet Title | `NAT` |
| `AT` | Alternative Title | CWR standard |
| `FT` | Formal Title | CWR standard |
| `IT` | Incorrect Title | CWR standard |
| `OT` | Original Title | CWR standard |
| `PT` | Part Title | CWR standard |
| `RT` | Revised Title | CWR standard |
| `TE` | Translation Title | CWR standard |
| `UT` | University Title | CWR standard |

Additional CWR title type codes are passed through as-is when present.

---

# Identifier types

Used on `identifiers[].type`. ISWC, ISRC, and EAN are first-class string arrays, not rows here.

| `type` | `source.type` | Description |
|---|---|---|
| `submitterWorkId` | `cwrSubmitter` | `NWR.SubmitterWorkNumber`. Source value is the `HDR` sender id |
| `societyWorkId` | `cisacSociety` | Society work id from `XRF`. Source value is the society code |
| `publisherWorkId` | `cwrSubmitter` or `ipiNameNumber` | Publisher work id. `XRF` 2–3 letter codes use `cwrSubmitter` |
| `assetId` | `dpid` | Recording asset id. Allowed by schema; current EDI does not emit it |
| `proprietary` | _(omitted)_ | `XRF` row with no organisation code |

`source.type` is `ipiNameNumber`, `cisacSociety`, `cwrSubmitter`, or `dpid`.

---

# Share Types

Used in `territories[].shareTypes[].type`.

| Value | Description | Source records |
|---|---|---|
| `own` | Ownership share — declared ownership percentage of the work | `SPU`, `OPU`, `SWR`, `OWR` |
| `coll` | Collection share — right to collect income in the territory | `SPT`, `OPT`, `SWT`, `OWT` |

---

# Controlled Values

Used in `parties[].controlled`.

| Value | Meaning | CWR record |
|---|---|---|
| `"yes"` | Party is controlled by the submitter | `SPU`, `SWR`, `SPT`, `SWT` |
| `"no"` | Party is not controlled by the submitter | `OPU`, `OWR`, `OPT`, `OWT` |