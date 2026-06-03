import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLookupDataTypes, getLookupSet, hasTisCode } from '../src/cwr-sdk/lookups';

describe('lookups', () => {
  it('bundles CISAC TIS export (official numeric codes)', () => {
    const doc = getLookupDataTypes();
    const tis = getLookupSet('tisNumericCodes');
    assert.ok(tis.length >= 200, `expected 200+ TIS strings, got ${tis.length}`);
    assert.ok(
      (doc as { tisEntryCount?: number }).tisEntryCount === undefined ||
        (doc as { tisEntryCount?: number }).tisEntryCount! >= 200,
      'expected CISAC export metadata when built from xlsx'
    );
    assert.ok(hasTisCode('2136'));
    assert.ok(hasTisCode('840'));
    assert.ok(hasTisCode('36'));
    assert.ok(hasTisCode('036'));
    assert.equal(doc.revision, 'r0');
    assert.match(doc.source, /CISAC TIS/i);
  });

  it('rejects unknown TIS codes', () => {
    assert.equal(hasTisCode('99999'), false);
  });
});
