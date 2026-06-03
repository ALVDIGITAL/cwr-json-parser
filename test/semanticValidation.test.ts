import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCwrJson } from '../src/index';

const baseMessages = { schema: 'CWR-JSON Schema v1.0', schemaDescription: 'Test' };

describe('semantic validation', () => {
  it('flags TIS overlap on same territory entry', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            messages: baseMessages,
            parties: [
              {
                role: 'E',
                territories: [
                  {
                    territory: { include: ['2136'], exclude: ['2136'] },
                    shareTypes: [{ type: 'coll', shares: [{ rightsType: 'pr', value: 50 }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('TIS_OVERLAP')));
  });

  it('flags sub-publisher with own shares', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            messages: baseMessages,
            parties: [
              {
                role: 'SE',
                territories: [
                  {
                    territory: { include: [], exclude: [] },
                    shareTypes: [{ type: 'own', shares: [{ rightsType: 'pr', value: 50 }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('SUBPUB_NO_OWN')));
  });

  it('flags duplicate submitterWorkNumber across works', () => {
    const work = {
      messages: baseMessages,
      identifiers: [{ source: 'submitterWorkNumber', value: 'DUP-1' }],
      parties: [{ role: 'C', territories: [] }],
    };
    const r = validateCwrJson({ works: [work, { ...work }] }, 'strict', 'cwr-json-v1-0', {
      normalize: false,
    });
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('ID_UNIQUE_SUBMITTER')));
  });
});
