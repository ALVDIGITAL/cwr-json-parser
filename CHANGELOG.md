## [1.2.0] - 2026-06-03

### Added

- Dual ESM + CommonJS build (tsup) so Vite/Vue can use named `import` and Lambda can keep `require()`.
- Official subpath exports:
  - `@alvdigital/cwr-json-parser/edi-preview`
  - `@alvdigital/cwr-json-parser/record-parser`
  - `@alvdigital/cwr-json-parser/schema`
- `guides/MIGRATION-VUE.md` for Playground migration from 1.1.x.

### Changed

- Package is `"type": "module"` with `.cjs` for CommonJS.
- Published `src/` so devtools source maps resolve (supported imports remain only via `exports`).
- Node **18+** required (`engines`).

### Notes

- Main API (`parseCwr`, validators) is unchanged.
- **CWR-JSON v1.0 output shape is unchanged** — no format bump for integrators.
- Spec errata (2026-06-03): removed incorrect “CWR 3.x” terminology; relinquishment is **CWR 2.2 Rev3**. Ownership (`own`) is not TIS-scoped; sub-publishers have no `own` rows. See `docs/Docs/overview/changelog.md`.
- See MIGRATION-VUE.md to remove Vite bridges and deep `dist/cwr-sdk` imports.

