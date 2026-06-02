import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCwrFilename,
  validateCwrRecordOrder,
  validateCwrSequence,
  validateCwrEdi,
} from '../src/index';
import { minimalOneWorkCwr, minimalOneWorkBadSequenceCwr } from './helpers/cwrFixtures';

describe('validateCwrFilename', () => {
  it('accepts standard CWR filenames', () => {
    const result = validateCwrFilename('CW250312BOU_000.V21');
    assert.equal(result.valid, true);
  });

  it('accepts generic .cwr names for local testing', () => {
    const result = validateCwrFilename('sample.cwr');
    assert.equal(result.valid, true);
  });

  it('rejects invalid filenames', () => {
    const result = validateCwrFilename('not-a-cwr-file.txt');
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /Invalid filename/i);
  });
});

describe('validateCwrRecordOrder', () => {
  it('passes for a minimal valid work block', () => {
    const result = validateCwrRecordOrder(minimalOneWorkCwr());
    assert.equal(result.valid, true);
  });
});

describe('validateCwrSequence', () => {
  it('passes for correct sequence numbers', () => {
    const result = validateCwrSequence(minimalOneWorkCwr());
    assert.equal(result.valid, true);
  });

  it('fails when RecordSeq on work-start is wrong', () => {
    const result = validateCwrSequence(minimalOneWorkBadSequenceCwr());
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /RecordSeq/i.test(e)));
  });
});

describe('validateCwrEdi', () => {
  it('aggregates filename, order, and sequence checks', () => {
    const content = minimalOneWorkCwr();
    const result = validateCwrEdi(content, 'CW250312BOU_000.V21');

    assert.equal(result.valid, true);
    assert.equal(result.filename?.valid, true);
    assert.equal(result.recordOrder?.valid, true);
    assert.equal(result.sequence?.valid, true);
  });

  it('reports sequence failures in combined validation', () => {
    const result = validateCwrEdi(minimalOneWorkBadSequenceCwr(), 'sample.cwr');
    assert.equal(result.valid, false);
    assert.equal(result.sequence?.valid, false);
  });
});
