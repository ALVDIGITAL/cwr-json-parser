import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkModel } from '../src/cwr-sdk/mapper/workModel/buildWorkModel';
import { mapXrfToIdentifier, pushIdentifier } from '../src/cwr-sdk/mapper/workModel/parseHelpers';
import { parseCwr, validateParsedCwr } from '../src/index';
import { cwrLine, minimalOneWorkCwr, xrfLine } from './helpers/cwrFixtures';

describe('mapXrfToIdentifier', () => {
  it('maps society work number (org as source)', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: '035',
        Identifier: '3987389001',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      { source: '035', value: '3987389001' }
    );
  });

  it('maps ISW to iswc source', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'ISW',
        Identifier: 'T-000.000.001-0',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      { source: 'iswc', value: 'T-000.000.001-0' }
    );
  });

  it('maps ISR to isrc source', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'ISR',
        Identifier: 'USRC17607839',
        IdentifierType: 'R',
        Validity: 'Y',
      }),
      { source: 'isrc', value: 'USRC17607839' }
    );
  });

  it('maps publisher submitter code as source', () => {
    assert.deepEqual(
      mapXrfToIdentifier({
        OrganisationCode: 'EMI',
        Identifier: 'EMI-00042',
        IdentifierType: 'W',
        Validity: 'Y',
      }),
      { source: 'EMI', value: 'EMI-00042' }
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
      { source: '035', value: 'BADID' }
    );
  });
});

describe('pushIdentifier', () => {
  it('dedupes on source and value', () => {
    const ids: { source: string; value: string }[] = [];
    pushIdentifier(ids, { source: 'iswc', value: 'T-000.000.001-0' });
    pushIdentifier(ids, { source: 'iswc', value: 'T-000.000.001-0' });
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

    assert.deepEqual(
      model.identifiers.filter((i) => i.source !== 'submitterWorkNumber'),
      [
        { source: '035', value: '3987389001' },
        { source: 'iswc', value: 'T0000000010' },
        { source: 'isrc', value: 'USRC17607839' },
        { source: 'EMI', value: 'EMI-00042' },
      ]
    );
  });

  it('skips XRF with org 000', () => {
    const lines = [
      ...minimalOneWorkCwr().split('\n'),
      xrfLine('00000001', '00000001', '000', '3987389001', 'W', 'Y'),
    ];
    const model = buildWorkModel(lines);
    assert.ok(!model.identifiers.some((i) => i.value === '3987389001'));
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
    const iswc = model.identifiers.filter((i) => i.source === 'iswc');
    assert.equal(iswc.length, 1);
    assert.equal(iswc[0].value, 'T0000000010');
  });
});

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
        (i) => i.source === '035' && i.value === '3987389001'
      )
    );
    assert.ok(
      result.works[0].identifiers?.some(
        (i) => i.source === 'isrc' && i.value === 'USRC17607839'
      )
    );
  });
});
