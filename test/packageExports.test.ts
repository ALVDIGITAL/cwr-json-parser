import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

describe('published CJS build', () => {
  it('loads main entry via require', () => {
    const mod = require(path.join(rootDir, 'dist/index.cjs'));
    assert.equal(typeof mod.parseCwr, 'function');
    assert.equal(typeof mod.validateParsedCwr, 'function');
  });

  it('loads subpaths via require', () => {
    const edi = require(path.join(rootDir, 'dist/edi-preview.cjs'));
    const records = require(path.join(rootDir, 'dist/record-parser.cjs'));
    const schema = require(path.join(rootDir, 'dist/schema.cjs'));

    assert.equal(typeof edi.splitIntoWorkBlocks, 'function');
    assert.equal(typeof edi.extractFirstWorkPreview, 'function');
    assert.equal(typeof records.parseRecordLine, 'function');
    assert.ok(records.recordDefinitions?.HDR);
    assert.equal(typeof schema.getSchemaAsset, 'function');
    assert.ok(schema.schemaAssetMap['cwr-json-v1-0']);
  });
});

describe('published ESM build', () => {
  it('loads main entry via import', async () => {
    const mod = await import(pathToFileURL(path.join(rootDir, 'dist/index.js')).href);
    assert.equal(typeof mod.parseCwr, 'function');
  });

  it('loads edi-preview subpath via import', async () => {
    const mod = await import(pathToFileURL(path.join(rootDir, 'dist/edi-preview.js')).href);
    assert.equal(typeof mod.splitIntoWorkBlocks, 'function');
    assert.equal(typeof mod.detectWorkRecordType, 'function');
  });
});
