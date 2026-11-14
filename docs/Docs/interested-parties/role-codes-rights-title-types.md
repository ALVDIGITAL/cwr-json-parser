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
| `AD` | Adaptor | Writer |
| `SR` | Sub Arranger | Writer |
| `SA` | Sub Author | Writer |
| `TR` | Translator | Writer |
| `E` | Original Publisher | Publisher |
| `SE` | Sub-Publisher | Publisher |
| `AM` | Administrator | Publisher |
| `PA` | Income Participant | Writer or publisher (in both CISAC tables) |
| `AQ` | Acquirer | Publisher |
| `ES` | Substituted Publisher | Publisher |
| `WR` | Writer (generic, CWR-JSON extension) | Writer |
| `OP` | Other Publisher (generic, CWR-JSON extension) | Publisher |
| `PRF` | Performing Artist (CWR-JSON extension) | Recording context |

Codes without "CWR-JSON extension" come from the CISAC Writer Designation and Publisher Type lookups.

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

Format `1.0.1` uses three labels for titles converted from CWR EDI:

| Code | Meaning in CWR-JSON | CWR Source Record |
|---|---|---|
| `TT` | Main work title | `NWR` / `REV` title |
| `ALT` | Alternate title | `ALT` |
| `NAT` | National (non-Roman) title, with `language` | `NAT` |

The schema also accepts the CISAC Title Type codes and `UT`:

| Code | CISAC description |
|---|---|
| `AT` | Alternative Title |
| `TE` | First Line of Text |
| `FT` | Formal Title |
| `IT` | Incorrect Title |
| `OT` | Original Title |
| `TT` | Original Title Translated |
| `PT` | Part Title |
| `RT` | Restricted Title |
| `ET` | Extra Search Title |
| `OL` | Original Title with National Characters |
| `AL` | Alternative Title with National Characters |
| `UT` | CWR-JSON extension (not in the CISAC table) |

> In format `1.0.1`, `ALT` and `NAT` titles carry the label `ALT` or `NAT`, not the `ALT.TitleType` / `NAT.TitleType` value from the EDI. The main title uses `TT`, while CISAC defines `TT` as "Original Title Translated". This is under review by the CWR-JSON subgroup.

---

# Identifier types

Used on `identifiers[].type`. ISWC, ISRC, and EAN are first-class string arrays, not rows here.

| `type` | `source.type` | Description |
|---|---|---|
| `submitterWorkId` | `cwrSubmitter` | `NWR.SubmitterWorkNumber`. Source value is the `HDR` sender id |
| `societyWorkId` | `cisacSociety` | Society work id from `XRF`. Source value is the society code |
| `publisherWorkId` | `cwrSubmitter` or `ipiNameNumber` | Publisher work id. `XRF` 2–3 letter codes use `cwrSubmitter` |
| `assetId` | `dpid` | Recording asset id. Allowed by schema; CWR EDI has no source field for it |
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
