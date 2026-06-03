---
title: 'Role Codes, Rights & Title types'
slug: role-codes-rights-types-title-types
metadata:
  robots: index
privacy:
  view: public
content:
  excerpt: >-
    Lookup tables for role codes, rights types, title types, identifier sources,
    and share types.
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

# Identifier Sources

Used in `identifiers[].source` and `recordings[].releases[].identifiers[].source`.

| Source | Description | Format |
|---|---|---|
| `iswc` | International Standard Work Code (ISO 15707) | `T-NNNNNNNNN-C` |
| `submitterWorkNumber` | Submitter's internal work ID | Alphanumeric, unique per submitter |
| `proprietary` | Other proprietary identifier | Varies |
| `ean` | EAN barcode (release-level) | 13-digit numeric string |
| `catalogNumber` | Release catalogue number | Alphanumeric |

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
