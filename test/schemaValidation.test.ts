import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCwrJson } from '../src/index';

const validWork = {
  messages: { schema: 'CWR-JSON Schema v1.0', schemaDescription: 'Test' },
  parties: [
    {
      role: 'C',
      territories: [
        {
          territory: { include: [], exclude: [] },
          shareTypes: [{ type: 'own', shares: [{ rightsType: 'pr', value: 50 }] }],
        },
      ],
    },
  ],
};

describe('schema validation (deep)', () => {
  it('rejects invalid role codes', () => {
    const r = validateCwrJson(
      {
      works: [{ ...validWork, parties: [{ role: 'INVALID', territories: [] }] }      ],
    },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('role') || e.includes('ROLE')));
  });

  it('rejects own territory with TIS include', () => {
    const r = validateCwrJson(
      {
      works: [
        {
          ...validWork,
          parties: [
            {
              role: 'C',
              territories: [
                {
                  territory: { include: ['2136'], exclude: [] },
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
    assert.ok(r.errors.some((e) => e.includes('OWN_TERRITORY') || e.includes('OWN_COLL')));
  });

  it('rejects invalid ISWC format', () => {
    const r = validateCwrJson(
      {
      works: [
        {
          ...validWork,
          identifiers: [{ source: 'iswc', value: 'not-an-iswc' }],
        },
      ],
    },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('ISWC')));
  });

  it('accepts minimal valid work', () => {
    const r = validateCwrJson({ works: [validWork] });
    assert.equal(r.valid, true, r.errors.join('\n'));
  });

  it('rejects invalid society code on share', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            ...validWork,
            parties: [
              {
                role: 'C',
                territories: [
                  {
                    territory: { include: [], exclude: [] },
                    shareTypes: [
                      {
                        type: 'coll',
                        shares: [{ rightsType: 'pr', value: 50, society: 'INVALID' }],
                      },
                    ],
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
    assert.ok(r.errors.some((e) => e.includes('society')));
  });

  it('rejects invalid header character set', () => {
    const r = validateCwrJson(
      {
        header: { characterSet: 'NOT-A-CHARSET' },
        works: [validWork],
      },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('characterSet')));
  });

  it('rejects invalid revocation reason', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            ...validWork,
            messages: {
              ...validWork.messages,
              revocation: { indicator: 'Y', reason: 'XX' },
            },
          },
        ],
      },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('reason')));
  });

  it('rejects invalid anomalous work reason', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            ...validWork,
            flags: { anomalous: true, anomalousReason: 'XX' },
          },
        ],
      },
      'strict',
      'cwr-json-v1-0',
      { normalize: false }
    );
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.includes('anomalousReason')));
  });
});
