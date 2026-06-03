import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  normalizeCwrJson,
  formatIswcForValidation,
  validateCwrJson,
} from '../src/index';

describe('normalizeCwrJson', () => {
  it('formats compact ISWC for validation', () => {
    assert.equal(formatIswcForValidation('T7021605949'), 'T-702160594-9');
    assert.equal(formatIswcForValidation('T-702160594-9'), 'T-702160594-9');
  });

  it('splits own+coll on the same territory entry', () => {
    const { data, notes } = normalizeCwrJson({
      works: [
        {
          messages: { schema: 'x', schemaDescription: 'y' },
          parties: [
            {
              role: 'CA',
              territories: [
                {
                  territory: { include: ['840'], exclude: [] },
                  shareTypes: [
                    { type: 'own', shares: [{ rightsType: 'pr', value: 50 }] },
                    { type: 'coll', shares: [{ rightsType: 'pr', value: 50 }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    assert.equal(data.works[0].parties![0].territories!.length, 2);
    assert.deepEqual(data.works[0].parties![0].territories![0].territory, {
      include: [],
      exclude: [],
    });
    assert.equal(data.works[0].parties![0].territories![0].shareTypes![0].type, 'own');
    assert.ok(notes.some((n) => n.includes('split')));
  });
});

describe('validation messages', () => {
  it('dedupes redundant territory schema errors', () => {
    const r = validateCwrJson(
      {
        works: [
          {
            messages: { schema: 'x', schemaDescription: 'y' },
            parties: [
              {
                role: 'CA',
                territories: [
                  {
                    territory: { include: ['840'], exclude: [] },
                    shareTypes: [
                      { type: 'own', shares: [{ rightsType: 'pr', value: 50 }] },
                      { type: 'coll', shares: [{ rightsType: 'pr', value: 50 }] },
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
    const codes = r.errors.map((e) => e.match(/\[([A-Z_]+)\]/)?.[1]);
    assert.ok(codes.includes('OWN_TERRITORY_TIS') || codes.includes('OWN_COLL_MIXED'));
    assert.ok(r.errors.length <= 4, `expected few errors, got ${r.errors.length}:\n${r.errors.join('\n')}`);
  });

  it('passes after normalize for combined territory layout', () => {
    const r = validateCwrJson({
      works: [
        {
          messages: { schema: 'x', schemaDescription: 'y' },
          identifiers: [{ source: 'iswc', value: 'T7021605949' }],
          parties: [
            {
              role: 'CA',
              territories: [
                {
                  territory: { include: ['840', '124'], exclude: [] },
                  shareTypes: [
                    { type: 'own', shares: [{ rightsType: 'pr', value: 50 }] },
                    { type: 'coll', shares: [{ rightsType: 'pr', value: 50 }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    assert.equal(r.valid, true, r.errors.join('\n'));
    assert.ok(r.warnings?.length);
  });
});

describe('CW260340WIX.json fixture', () => {
  const path = 'c:/Users/Miroslav/Downloads/CW260340WIX.json';

  it('validates user export after normalize', { skip: !existsSync(path) }, () => {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    const r = validateCwrJson(data);
    assert.equal(r.valid, true, r.errors.join('\n'));
    assert.ok((r.warnings?.length ?? 0) > 0, 'expected normalization warnings');
  });
});
