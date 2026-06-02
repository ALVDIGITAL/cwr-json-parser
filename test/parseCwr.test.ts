import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCwr, validateCwrJson, validateParsedCwr } from '../src/index';
import { minimalOneWorkCwr } from './helpers/cwrFixtures';

describe('parseCwr', () => {
  it('parses a minimal single-work file into Schema v1.0 output', () => {
    const result = parseCwr(minimalOneWorkCwr());

    assert.equal(result.works.length, 1);
    assert.ok(result.works[0].titles?.some((t) => t.value.trim() === 'TEST WORK'));
    assert.equal(result.works[0].messages.schema, 'CWR-JSON Schema v1.0');
    assert.ok(result.header?.senderName?.includes('TEST PUBLISHER'));
  });

  it('output passes JSON Schema validation', () => {
    const result = parseCwr(minimalOneWorkCwr());
    const validation = validateParsedCwr(result);
    assert.equal(validation.valid, true, validation.errors.join('\n'));
  });
});

describe('validateCwrJson', () => {
  it('rejects invalid payloads', () => {
    const validation = validateCwrJson({ works: 'not-an-array' });
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });

  it('advisory mode reports errors but returns valid: true', () => {
    const validation = validateCwrJson({ works: 'not-an-array' }, 'advisory');
    assert.equal(validation.valid, true);
    assert.ok(validation.errors.length > 0);
  });
});
