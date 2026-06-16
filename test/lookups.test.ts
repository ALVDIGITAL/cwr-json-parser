import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLookupDataTypes,
  getLookupSet,
  hasSocietyCode,
  hasTisCode,
} from '../src/cwr-sdk/lookups';

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
    assert.equal(doc.revision, 'r1');
    assert.match(doc.source, /CISAC TIS/i);
  });

  it('rejects unknown TIS codes', () => {
    assert.equal(hasTisCode('99999'), false);
  });

  it('merges CISAC role and title sets with CWR-JSON extensions', () => {
    const roles = getLookupSet('roleCodes');
    const titles = getLookupSet('titleTypes');
    assert.ok(roles.includes('CA'));
    assert.ok(roles.includes('E'));
    assert.ok(roles.includes('WR'));
    assert.ok(titles.includes('ALT'));
    assert.ok(titles.includes('ET'));
    assert.ok(titles.includes('NAT'));
  });

  it('loads CISAC-sourced validation sets', () => {
    assert.ok(getLookupSet('characterSets').length >= 10);
    assert.ok(getLookupSet('societyCodes').length >= 300);
    assert.ok(getLookupSet('languageCodes').length >= 100);
    assert.ok(getLookupSet('revocationReasons').length >= 4);
    assert.ok(getLookupSet('anomalousWorkReasons').length >= 2);
    assert.ok(hasSocietyCode('35'));
    assert.ok(hasSocietyCode('035'));
    assert.equal(hasSocietyCode('not-a-society'), false);
  });

  it('includes CISAC bundle metadata', () => {
    const doc = getLookupDataTypes() as {
      cisacSource?: string;
      cisacGeneratedAt?: string;
    };
    assert.match(doc.cisacSource ?? '', /CWR08-3615R2/i);
    assert.ok(doc.cisacGeneratedAt);
  });
});
