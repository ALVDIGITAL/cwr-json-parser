import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecordLine } from '../src/cwr-sdk/parser/recordParser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean);

const ack = mdw.find((l) => l.startsWith('ACK'))!;
const msg = mdw.find((l) => l.startsWith('MSG'))!;

describe('parseRecordLine ACK/MSG', () => {
  it('parses ACK into real columns (not Raw)', () => {
    const { type, fields } = parseRecordLine(ack);
    assert.equal(type, 'ACK');
    assert.equal(fields.some((f) => f.label === 'Raw'), false);
    const by = Object.fromEntries(fields.map((f) => [f.label, f.value.trim()]));
    assert.equal(by.CreationDate, '20260716');
    assert.equal(by.CreationTime, '113954');
    assert.equal(by.OriginalGroupId, '00001');
    assert.equal(by.OriginalTransactionType, 'NWR');
    assert.equal(by.TransactionStatus, 'AC');
    assert.ok(String(by.SubmitterCreationNumber).includes('ALV003306733PW'));
  });

  it('parses MSG into real columns (MessageType size 1)', () => {
    const { type, fields } = parseRecordLine(msg);
    assert.equal(type, 'MSG');
    assert.equal(fields.some((f) => f.label === 'Raw'), false);
    const by = Object.fromEntries(fields.map((f) => [f.label, f.value.trim()]));
    assert.equal(by.MessageType, 'F');
    assert.equal(by.OriginalRecordSequence, '00000008');
    assert.equal(by.MessageRecordType, 'OWR');
    assert.equal(by.MessageLevel, 'F');
    assert.equal(by.ValidationNumber, '009');
    assert.match(by.MessageText, /WRITER CAE/);
  });
});
