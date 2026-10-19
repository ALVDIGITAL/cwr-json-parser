import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkModel } from '../src/cwr-sdk/mapper/workModel/buildWorkModel';
import { mapXrfToIdentifier, pushIdentifier } from '../src/cwr-sdk/mapper/workModel/parseHelpers';
import { isIswcIdentifier, type WorkIdentifierEntry } from '../src/cwr-sdk/types/cwr';
import { parseCwr, validateParsedCwr } from '../src/index';
import { cwrLine, minimalOneWorkCwr, xrfLine } from './helpers/cwrFixtures';

describe('mapXrfToIdentifier', () => {
  it('maps society work number to a namespaced triple', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: '035',
        Identifier: '3987389001',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      {
        kind: 'identifier',
        identifier: {
          type: 'societyWorkId',
          value: '3987389001',
          source: { type: 'cisacSociety', value: '035' },
        },
      }
    );
  });

  it('maps ISW onto the work ISWC array', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'ISW',
        Identifier: 'T-000.000.001-0',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      { kind: 'iswc', value: 'T-000.000.001-0' }
    );
  });

  it('maps a product EAN when IdentifierType is P', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'EMI',
        Identifier: '5099996897027',
        IdentifierType: 'P',
        Validity: 'Y',
      }),
      { kind: 'ean', value: '5099996897027' }
    );
  });

  it('drops a recording id that is not an ISRC and skips video rows', () => {
    assert.equal(
      mapXrfToIdentifier({
        OrganisationCode: 'ISR',
        Identifier: 'NOT-AN-ISRC',
        IdentifierType: 'R',
        Validity: 'Y',
      }),
      null
    );
    assert.equal(
      mapXrfToIdentifier({
        OrganisationCode: 'EMI',
        Identifier: 'VIDEO-1',
        IdentifierType: 'V',
        Validity: 'Y',
      }),
      null
    );
  });

  it('maps ISR onto an ISRC array', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'ISR',
        Identifier: 'USRC17607839',
        IdentifierType: 'R',
        Validity: 'Y',
      }),
      { kind: 'isrc', value: 'USRC17607839' }
    );
  });

  it('maps a submitter code to a publisher work id', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'EMI',
        Identifier: 'EMI-00042',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      {
        kind: 'identifier',
        identifier: {
          type: 'publisherWorkId',
          value: 'EMI-00042',
          source: { type: 'cwrSubmitter', value: 'EMI' },
        },
      }
    );
  });

  it('skips invalid org codes 000 and 099', () => {
    assert.equal(
      mapXrfToIdentifier({
        OrganisationCode: '000',
        Identifier: '123',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      null
    );
    assert.equal(
      mapXrfToIdentifier({
        OrganisationCode: '099',
        Identifier: '123',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      null
    );
  });

  it('includes rows with Validity N or U', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: '035',
        Identifier: 'BADID',
        IdentifierType: 'W',
        Validity: 'N',
      }),
      {
        kind: 'identifier',
        identifier: {
          type: 'societyWorkId',
          value: 'BADID',
          source: { type: 'cisacSociety', value: '035' },
        },
      }
    );
  });
});

describe('pushIdentifier', () => {
  it('dedupes on type, value, and source', () => {
    const ids = [];
    const entry = {
      type: 'societyWorkId' as const,
      value: '3987389001',
      source: { type: 'cisacSociety' as const, value: '035' },
    };
    pushIdentifier(ids, entry);
    pushIdentifier(ids, { ...entry, source: { ...entry.source, name: 'GEMA' } });
    assert.equal(ids.length, 1);
  });
});

describe('buildWorkModel XRF', () => {
  it('parses XRF records into identifiers', () => {
    const lines = [
      ...minimalOneWorkCwr().split('\n'),
      xrfLine('00000001', '00000001', '035', '3987389001', 'W', 'Y'),
      xrfLine('00000001', '00000002', 'ISW', 'T0000000010', 'W', 'Y'),
      xrfLine('00000001', '00000003', 'ISR', 'USRC17607839', 'R', 'Y'),
      xrfLine('00000001', '00000004', 'EMI', 'EMI-00042', 'W', 'Y'),
    ];
    const model = buildWorkModel(lines);

    assert.deepEqual(iswcOf(model.identifiers), ['T-000.000.001-0']);
    assert.deepEqual(model.recordings, [{ isrc: ['USRC17607839'] }]);
    assert.deepEqual(
      model.identifiers.filter((i) => !isIswcIdentifier(i) && i.type !== 'submitterWorkId'),
      [
        {
          type: 'societyWorkId',
          value: '3987389001',
          source: { type: 'cisacSociety', value: '035' },
        },
        {
          type: 'publisherWorkId',
          value: 'EMI-00042',
          source: { type: 'cwrSubmitter', value: 'EMI' },
        },
      ]
    );
  });

  it('skips XRF with org 000', () => {
    const lines = [
      ...minimalOneWorkCwr().split('\n'),
      xrfLine('00000001', '00000001', '000', '3987389001', 'W', 'Y'),
    ];
    const model = buildWorkModel(lines);
    assert.ok(!model.identifiers.some((i) => !isIswcIdentifier(i) && i.value === '3987389001'));
  });

  it('dedupes ISWC from NWR and XRF ISW', () => {
    const nwr = cwrLine('NWR', {
      4: '00000001',
      12: '00000000',
      20: 'TEST WORK'.padEnd(60, ' '),
      82: 'SW00000000001',
      96: 'T0000000010',
      127: 'POP',
      136: 'U',
      143: 'ORI',
    }, 320);
    const lines = [
      ...minimalOneWorkCwr().split('\n').slice(0, 2),
      nwr,
      xrfLine('00000001', '00000001', 'ISW', 'T0000000010', 'W', 'Y'),
    ];
    const model = buildWorkModel(lines);
    assert.deepEqual(iswcOf(model.identifiers), ['T-000.000.001-0']);
  });

  it('puts each unmatched ISRC and EAN on its own recording', () => {
    const lines = [
      ...minimalOneWorkCwr().split('\n'),
      xrfLine('00000001', '00000001', 'ISR', 'USRC17607839', 'R', 'Y'),
      xrfLine('00000001', '00000002', 'ISR', 'GBEMI7500001', 'R', 'Y'),
      xrfLine('00000001', '00000003', 'EMI', '5099996897027', 'P', 'Y'),
      xrfLine('00000001', '00000004', 'EMI', 'NOT-AN-EAN', 'P', 'Y'),
      xrfLine('00000001', '00000005', 'EMI', 'VIDEO-1', 'V', 'Y'),
    ];
    const model = buildWorkModel(lines);
    assert.deepEqual(model.recordings, [
      { isrc: ['USRC17607839'] },
      { isrc: ['GBEMI7500001'] },
      { releases: [{ ean: ['5099996897027'] }] },
    ]);
  });
});

function iswcOf(identifiers: WorkIdentifierEntry[]) {
  return identifiers.find(isIswcIdentifier)?.iswc;
}

describe('parseCwr XRF validation', () => {
  it('output with XRF identifiers passes JSON Schema validation', () => {
    const cwr = [
      minimalOneWorkCwr(),
      xrfLine('00000001', '00000001', '035', '3987389001', 'W', 'Y'),
      xrfLine('00000001', '00000002', 'ISR', 'USRC17607839', 'R', 'Y'),
    ].join('\n');
    const result = parseCwr(cwr);
    const validation = validateParsedCwr(result);
    assert.equal(validation.valid, true, validation.errors.join('\n'));
    assert.ok(
      result.works[0].identifiers?.some(
        (i) =>
          !isIswcIdentifier(i) &&
          i.type === 'societyWorkId' &&
          i.value === '3987389001' &&
          i.source?.type === 'cisacSociety' &&
          i.source.value === '035'
      )
    );
    assert.deepEqual(result.works[0].recordings, [{ isrc: ['USRC17607839'] }]);
  });
});
