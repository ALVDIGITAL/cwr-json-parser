# CWR-JSON spec docs: editing guide

Rules for anyone (people or agents) editing the specification pages in `docs/Docs/`. This file lives outside `docs/Docs/`, so it is not published to ReadMe.

## 1. Audience and principle

The docs are a **specification** for integrators who build their own CWR EDI to CWR-JSON converter from the published schema. They do not have our parser or this repository.

Every page states rules about the JSON: what a valid file contains, and how CWR EDI fields map to it. No page describes what a particular tool does.

## 2. Wording rules

| Instead of | Write |
|---|---|
| "The parser emits / writes X" | "A CWR-JSON file contains X" or "Converters must / should write X" |
| "Parser source: `FIELD`" | "From CWR: `RECORD.FIELD`" |
| "Allowed by the schema; the parser does not emit it" | "Reserved. Allowed by the schema but has no CWR EDI source in format `1.0.1`. Converters should omit it." |
| "The current parser outputs `""` here (bug)" | The intended rule, e.g. "Omit `ipi` when the CWR field is blank" |
| "Parser output (passes the schema)" | "CWR-JSON (passes the schema)" or "Example document" |

- **must**: enforced by the JSON Schema or the semantic rules, or required for correct meaning.
- **should**: a recommended convention that the schema does not enforce.
- State an implementation quirk as a rule or a known limitation of the format. Never name the tool.
- Outside the informative section, do not use: parser, emit, mapper, serialiser, `src/` paths, function or module names (`buildWorkModel`, `schemaV1`, …), npm package names, `test/files`, "Playground output".

## 3. Informative boundary

Implementation details are allowed only in the **Reference implementation (informative)** section at the end of `docs/Docs/overview/introduction.md`. That section says it is not part of the specification, and that the spec pages win when they differ.

You may link the CWR-JSON Playground (`https://cwr.alvdev.com/#/`) as an optional way to preview results. Never present it as the source of a rule.

## 4. Source of truth when docs and code disagree

- Validity is defined by the schema `src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json` and the lookup file `src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0_r0.json`.
- Parser code (`src/cwr-sdk/mapper/`) is evidence of current behavior, not the spec.
- If the parser does something the spec should not allow, write the intended rule in the doc. Report the parser bug separately to the user. Do not document the bug as the rule.
- Changes to the schema, the lookup file or the format need approval from the user or the SPF. Never change them as a side effect of a docs task.

## 5. Changelog (`docs/Docs/overview/changelog.md`)

- Title entries by the spec or format change ("Optional `tags` on header and messages"), not by parser release ("Parser 1.5.3").
- Follow the **Version governance** section on that page: MAJOR, MINOR and PATCH for the format; Validation and Document revision tracked separately. Implementation releases are not listed.
- Write each line as the resulting rule ("Root `$schema` is not allowed"). Do not log what text was removed, moved or previously wrong; readers only need the current rule.
- Put text-only fixes in a dated "Documentation errata (no format bump)" entry. Add to the latest one if it is still unpublished.
- Never bump the format number or mark a release Published without approval.

## 6. Format facts to keep consistent

- Format `1.0.1`, status Published. SPF formal approval: pending until the user says otherwise.
- Schema filename keeps `v1.0` for every `1.0.x`. The lookup file is named `_r0`, but its content reports `"revision": "r1"`.
- A root `$schema` property is **not allowed** in data files (root allows only `header` and `works`).
- "draft-07" in the schema file is the name of the JSON Schema language version. It does not mean CWR-JSON is a draft. Say so whenever you mention it.
- `flags.aiUsage`: document `M` / `T` / `A` (CISAC). The schema also accepts `B`/`N`/`U`/`Y`, which are under review.
- `own` territory entries have empty `include` / `exclude` and exactly one share type. Only writers and `E` publishers carry `own`.
- Empty optional fields are omitted, never written as `null` or `""`.
- `messages.schema` and `messages.schemaDescription` are required on every work. Both are free-text labels.

## 7. ReadMe conventions

- Keep each page's front matter keys: `appearance`, `category.uri`, `parent.uri`, `position`, `privacy`, `slug`, `title` (plus `content.excerpt` where present). Do not rename slugs without updating every link.
- Internal links use `/docs/<slug>` (optionally `#anchor`). The slug must match a page's front matter, e.g. `/docs/examples`, `/docs/role-codes-rights-title-types`.
- ReadMe MDX components such as `<Anchor>` and `<Callout>` are allowed.
- Code fences:
  - ` ```json ` only for valid JSON (a complete document or a fragment that can be wrapped).
  - ` ```jsonc ` for JSON with comments.
  - ` ```text ` for outlines and pseudo-structures.
- Publishing: a push to `main` that touches `docs/Docs/**` runs `.github/workflows/readme-docs.yml`, which uploads with `rdme docs upload`. It needs the `README_API_KEY` secret (and optional `README_BRANCH` variable).

## 8. Examples

- Every ` ```json ` block must pass the published schema and the strict semantic rules (`TIS_OVERLAP`, `OWN_EMPTY_TIS`, `SUBPUB_NO_OWN`, `PUB_OWN_E_ONLY`, `ID_UNIQUE_SUBMITTER`, `TIS_UNKNOWN`), on its own or wrapped in a minimal document.
- Base example data on real CWR EDI and show the EDI next to the JSON when practical.
- If an example differs from the raw conversion, add a note that states the rule ("`ipi` is omitted because the EDI has none"), not the history of the edit.

## 9. Checklist before finishing

1. Validate every ` ```json ` block against the schema (Ajv 8, `new Ajv({ allErrors: true, strict: false })` with `ajv-formats`) and the semantic rules.
2. Check that every internal `/docs/<slug>` link matches a front matter `slug`.
3. Grep for implementation wording:

   ```text
   rg -n -i "parser|emit|mapper|serialis|src/|buildWorkModel|projectCanonical|schemaV1|test/files" docs/Docs
   ```

   Allowed hits: the informative section in `overview/introduction.md`, the phrase "read without a CWR parser", sentences about CWR EDI parsers in general, and data values such as `"CWR-JSON PLAYGROUND"`.
4. Add a changelog errata line for any change in meaning.
5. Do not commit, push or publish unless the user asks.
