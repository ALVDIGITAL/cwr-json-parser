# cwr-json-parser

Framework-agnostic library that parses [CWR](https://en.wikipedia.org/wiki/Common_Works_Registration) (Common Works Registration) files into canonical JSON. Use it from Node, browsers, React, Vue, or any other environment — there is no UI or framework dependency.

## Install

From GitHub Packages (recommended for apps):

```bash
npm install @alvdigital/cwr-json-parser
```

From a Git URL (e.g. `"github:ALVDIGITAL/cwr-json-parser"` in `package.json`): the published commit must include the compiled `dist/` folder. After changing `src/`, run `npm run build` and commit `dist/` before pushing.

## Usage

The package exports a single parser function, `parseCwr`, which accepts the **full text** of a CWR file and returns [**CWR-JSON Schema v1.0**](src/cwr-sdk/mapper/schemas/schemaV1.ts) output.

### Node.js

```js
const fs = require('fs');
const { parseCwr } = require('@alvdigital/cwr-json-parser');

const cwrText = fs.readFileSync('submission.V21', 'utf8');
const json = parseCwr(cwrText);
console.log(json.works.length);
```

### Browser / React / Vue

Read the file as text, then parse:

```ts
import { parseCwr, type SchemaV1Output } from '@alvdigital/cwr-json-parser';

async function onFileSelected(file: File): Promise<SchemaV1Output> {
  const cwrText = await file.text();
  return parseCwr(cwrText);
}
```

### TypeScript

Types for the result are exported from the same entry point:

```ts
import { parseCwr, type SchemaV1Output, type SchemaV1WorkOutput } from '@alvdigital/cwr-json-parser';
```

## API

### Parsing

#### `parseCwr(cwrContent: string): SchemaV1Output`

- **Input:** CWR file contents as a UTF-8 string (all works in the file are parsed).
- **Output:** `{ header?, works: SchemaV1WorkOutput[] }` — CWR-JSON Schema v1.0. Each work includes `messages.schema` and `messages.schemaDescription` from the v1.0 contract.

### JSON Schema validation

#### `validateCwrJson(payload, mode?, schemaId?): ValidationResult`

Validates parsed output (or any object) against the bundled CWR-JSON v1.0 JSON Schema.

- `mode`: `'strict'` (default) — `valid` reflects schema compliance; `'advisory'` — always `valid: true` but still returns `errors`.

#### `validateParsedCwr(payload: SchemaV1Output, mode?): ValidationResult`

Alias for validating `parseCwr` output.

### EDI / file validation (raw CWR text)

#### `validateCwrFilename(filename): ValidationResult`

Checks the `CWyynnnnsss_rrr.Vxx` naming convention. Generic `*.cwr` names are allowed for local testing.

#### `validateCwrRecordOrder(cwrContent, scope?): ValidationResult`

Validates record order inside work block(s). `scope`: `'first'` | `'all'` (default `'all'`).

#### `validateCwrSequence(cwrContent, scope?): ValidationResult`

Validates `TransactionSeq` / `RecordSeq` numbering. `scope`: `'first'` | `'all'` (default `'all'`).

#### `validateCwrEdi(cwrContent, filename?, options?): CwrEdiValidationResult`

Runs filename (when provided), record order, and sequence checks in one call:

```ts
const edi = validateCwrEdi(cwrText, 'CW250312BOU_000.V21', {
  scope: 'all',
  filename: true,
  recordOrder: true,
  sequence: true,
});
```

### Typical pipeline

```ts
const edi = validateCwrEdi(cwrText, fileName);
if (!edi.valid) throw new Error('Invalid CWR file');

const json = parseCwr(cwrText);
const schema = validateParsedCwr(json);
if (!schema.valid) throw new Error(schema.errors.join('\n'));
```

## Development

```bash
npm install
npm run build
npm test
```

Compiled output is written to `dist/`. Registry installs receive `dist/` from the published tarball (`prepublishOnly` runs the build automatically).
