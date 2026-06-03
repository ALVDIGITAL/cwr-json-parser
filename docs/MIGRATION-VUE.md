# Migrating the Playground to @alvdigital/cwr-json-parser@1.2.0+

This checklist applies after upgrading from **1.1.x** (single CJS entry) to **1.2.0+** (dual ESM/CJS + subpath exports).

## 1. Bump the dependency

```bash
npm install @alvdigital/cwr-json-parser@^1.2.0
```

Ensure `.npmrc` / `NODE_AUTH_TOKEN` for GitHub Packages still work.

## 2. Replace deep imports with subpaths

| Before (blocked or brittle) | After |
|----------------------------|--------|
| Deep import of `splitIntoWorkBlocks` from `dist/cwr-sdk/...` | `import { splitIntoWorkBlocks, extractFirstWorkPreview } from '@alvdigital/cwr-json-parser/edi-preview'` |
| Deep import of `parseRecordLine` / `recordDefinitions` | `import { parseRecordLine, recordDefinitions } from '@alvdigital/cwr-json-parser/record-parser'` |
| Deep import of `getSchemaAsset` | `import { getSchemaAsset, schemaAssetMap } from '@alvdigital/cwr-json-parser/schema'` |
| `parseCwr`, validators | `import { ... } from '@alvdigital/cwr-json-parser'` (unchanged) |

## 3. Remove Vite / Quasar workarounds

Delete or revert anything that existed only for CJS interop:

- **esbuild virtual-module bridge** in `quasar.config.js` (or equivalent) that re-exported `splitIntoWorkBlocks`
- **`cwr-parser.ts`** (or similar) that default-imported CJS and re-exported named symbols
- **`strip-cwr-parser-sourcemaps.cjs`** (or Vite plugin) — source maps now resolve because `src/` is published

## 4. Simplify imports in app code

Use normal ESM named imports everywhere, for example:

```ts
import { parseCwr } from '@alvdigital/cwr-json-parser';
import { splitIntoWorkBlocks } from '@alvdigital/cwr-json-parser/edi-preview';
```

No `virtual:` module IDs, no default-import + manual re-export.

## 5. Verify locally

- `quasar dev` / `vite` — no `does not provide an export named …` errors
- No Vite warnings about missing source files under `node_modules/@alvdigital/cwr-json-parser`
- Playground flows: parse file, EDI preview, field UI, schema workbench

## What stayed the same

- `parseCwr(cwrText)` input/output contract
- Validator function names and behavior
- Lambda / Node `require('@alvdigital/cwr-json-parser')` still works via the `require` export condition
