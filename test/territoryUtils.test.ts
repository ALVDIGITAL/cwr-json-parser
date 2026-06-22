import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { upsertCollectionTerritory } from '../src/cwr-sdk/mapper/territoryUtils';

function makeParticipant() {
  return { territories: [] as any[] };
}

describe('upsertCollectionTerritory', () => {
  it('merges exclude scope-only record into active include+shares territory (KEY015 pattern)', () => {
    const participant = makeParticipant();

    upsertCollectionTerritory(participant, {
      incl: true,
      tis: ['2136'],
      collShares: [
        { rightsType: 'pr', value: 50 },
        { rightsType: 'mr', value: 100 },
        { rightsType: 'sr', value: 100 },
      ],
    });

    upsertCollectionTerritory(participant, {
      incl: false,
      tis: ['0056'],
      collShares: [
        { rightsType: 'pr', value: 0 },
        { rightsType: 'mr', value: 0 },
        { rightsType: 'sr', value: 0 },
      ],
    });

    assert.equal(participant.territories.length, 1);
    assert.deepEqual(participant.territories[0].territory.include, ['2136']);
    assert.deepEqual(participant.territories[0].territory.exclude, ['0056']);

    const shares = participant.territories[0].shareTypes[0].shares;
    assert.equal(shares.length, 3);
    assert.ok(shares.every((s: { value: number }) => s.value > 0));
  });

  it('accumulates multiple exclude scope-only records (KEY005D pattern)', () => {
    const participant = makeParticipant();

    upsertCollectionTerritory(participant, {
      incl: true,
      tis: ['2136'],
      collShares: [
        { rightsType: 'pr', value: 50 },
        { rightsType: 'mr', value: 100 },
        { rightsType: 'sr', value: 100 },
      ],
    });

    for (const code of ['0040', '0050', '0056']) {
      upsertCollectionTerritory(participant, {
        incl: false,
        tis: [code],
        collShares: [
          { rightsType: 'pr', value: 0 },
          { rightsType: 'mr', value: 0 },
          { rightsType: 'sr', value: 0 },
        ],
      });
    }

    assert.equal(participant.territories.length, 1);
    assert.deepEqual(participant.territories[0].territory.include, ['2136']);
    assert.deepEqual(participant.territories[0].territory.exclude.sort(), ['0040', '0050', '0056']);
  });

  it('keeps separate territories when share profiles differ (MOD017 pattern)', () => {
    const participant = makeParticipant();

    upsertCollectionTerritory(participant, {
      incl: true,
      tis: ['2136'],
      collShares: [{ rightsType: 'pr', value: 50 }],
    });

    upsertCollectionTerritory(participant, {
      incl: false,
      tis: ['0056'],
      collShares: [
        { rightsType: 'pr', value: 0 },
        { rightsType: 'mr', value: 0 },
        { rightsType: 'sr', value: 0 },
      ],
    });

    upsertCollectionTerritory(participant, {
      incl: true,
      tis: ['0056'],
      collShares: [{ rightsType: 'pr', value: 66.67 }],
    });

    assert.equal(participant.territories.length, 2);
    assert.deepEqual(participant.territories[0].territory, {
      include: ['2136'],
      exclude: ['0056'],
    });
    assert.deepEqual(participant.territories[1].territory, {
      include: ['0056'],
      exclude: [],
    });
  });
});
