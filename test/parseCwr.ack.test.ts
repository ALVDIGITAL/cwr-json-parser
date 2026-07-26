import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCwr, validateCwrJson } from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(__dirname, 'files/151708_CW260050035_MDW.V22'), 'utf8');

describe('parseCwr ACK', () => {
  it('maps ACK fields flat onto messages and keeps nested NWR titles', () => {
    const out = parseCwr(raw);
    assert.equal(out.works.length, 92);
    const w0 = out.works[0];
    assert.equal(w0.messages.type, 'ack');
    assert.equal(w0.messages.transactionStatus, 'AC');
    assert.equal(w0.messages.creationDate, '20260716');
    assert.equal(w0.messages.originalTransactionType, 'NWR');
    assert.match(String(w0.messages.creationTitle), /COWBOYS/);
    assert.ok(w0.titles?.some((t) => t.type === 'TT'));
  });

  it('maps MSG into msgs with extras', () => {
    const out = parseCwr(raw);
    const withMsg = out.works.find(
      (w) => Array.isArray(w.messages.msgs) && (w.messages.msgs?.length ?? 0) > 0
    );
    assert.ok(withMsg);
    const m = withMsg!.messages.msgs![0];
    assert.equal(m.status, 'F');
    assert.equal(m.recordType, 'OWR');
    assert.equal(m.messageLevel, 'F');
    assert.equal(m.validationNumber, '009');
    assert.match(String(m.message), /WRITER CAE/);
  });

  it('ACK messages shape passes JSON Schema', () => {
    const validation = validateCwrJson({
      works: [
        {
          messages: {
            type: 'ack',
            creationDate: '20260716',
            creationTime: '113954',
            originalGroupId: '00001',
            originalTransactionSequence: '00000000',
            originalTransactionType: 'NWR',
            creationTitle: '(WE ARE) THE COWBOYS',
            submitterCreationNumber: 'ALV003306733PW',
            recipientCreationNumber: '0044170896001',
            processingDate: '20260716',
            transactionStatus: 'AC',
            schema: 'CWR-JSON Schema v1.0',
            schemaDescription: 'test',
            msgs: [
              {
                status: 'F',
                message: 'WRITER CAE ENTERED NOT FOUND IN THE WRITER CAE TABLE',
                originalRecordSequence: '00000008',
                recordType: 'OWR',
                messageLevel: 'F',
                validationNumber: '009',
              },
            ],
          },
        },
      ],
    });
    assert.equal(validation.valid, true, validation.errors.join('\n'));
  });
});
