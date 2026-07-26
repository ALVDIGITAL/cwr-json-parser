import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectWorkRecordType, splitIntoWorkBlocks } from '../src/cwr-sdk/parser/blockExtractor';
import { validateRecordOrder } from '../src/cwr-sdk/validators/recordOrderValidator';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);

describe('ACK block extraction', () => {
  it('detects ACK transaction type', () => {
    assert.equal(detectWorkRecordType(lines), 'ACK');
  });

  it('splits one block per ACK (nested NWR stays inside)', () => {
    const { workRecordType, blocks } = splitIntoWorkBlocks(raw);
    assert.equal(workRecordType, 'ACK');
    assert.equal(blocks.length, 92);
    const first = blocks[0];
    assert.ok(first.some((l) => l.startsWith('ACK')));
    assert.ok(first.some((l) => l.startsWith('NWR')));
  });

  it('allows ACK header + nested NWR + MSG in record order', () => {
    const { blocks } = splitIntoWorkBlocks(raw);
    const withMsg = blocks.find((b) => b.some((l) => l.startsWith('MSG')));
    assert.ok(withMsg);
    const order = validateRecordOrder(withMsg!);
    assert.equal(order.ok, true, order.problems.join('\n'));
  });
});
