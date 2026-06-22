import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCwr } from '../src/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readFixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, 'files', name), 'utf8');
}

type Party = {
  partyId?: string;
  role?: string;
  territories?: {
    territory?: { include?: string[]; exclude?: string[] };
    shareTypes?: { type?: string; shares?: { value?: number }[] }[];
  }[];
  representedBy?: Party[];
};

function collectParties(parties: Party[] = []): Party[] {
  const out: Party[] = [];
  for (const party of parties) {
    out.push(party);
    if (party.representedBy?.length) {
      out.push(...collectParties(party.representedBy));
    }
  }
  return out;
}

function countZeroCollShares(parties: Party[]): number {
  let count = 0;
  for (const party of parties) {
    for (const territory of party.territories || []) {
      for (const shareType of territory.shareTypes || []) {
        if (shareType.type !== 'coll') continue;
        for (const share of shareType.shares || []) {
          if (share.value === 0) count++;
        }
      }
    }
  }
  return count;
}

function findPartyById(parties: Party[], partyId: string): Party | undefined {
  return collectParties(parties).find((p) => p.partyId === partyId);
}

function countPartyIdUnderParent(parent: Party, partyId: string): number {
  return (parent.representedBy || []).filter((p) => p.partyId === partyId).length;
}

describe('KEY015 fixture', () => {
  it('merges include/exclude into one coll territory for sub-publisher C', () => {
    const result = parseCwr(readFixture('BC-key015.V22'));
    const parties = result.works[0].parties || [];
    const ePublisher = findPartyById(parties, 'P00000001');
    assert.ok(ePublisher, 'E publisher P00000001 expected');

    const subC = findPartyById(parties, 'P00000004');
    assert.ok(subC, 'sub-publisher P00000004 expected');

    assert.equal(countPartyIdUnderParent(ePublisher!, 'P00000004'), 1);

    const collTerritories = (subC!.territories || []).filter((t) =>
      t.shareTypes?.some((st) => st.type === 'coll')
    );
    assert.equal(collTerritories.length, 1);
    assert.deepEqual(collTerritories[0].territory?.include, ['2136']);
    assert.deepEqual(collTerritories[0].territory?.exclude, ['0056']);

    assert.equal(countZeroCollShares(parties), 0);
  });
});

describe('SPU sibling dedupe regressions', () => {
  it('KEY008 keeps same sub-publisher under different E parents', () => {
    const result = parseCwr(readFixture('BC-key008.V22'));
    const parties = result.works[0].parties || [];
    const allB = collectParties(parties).filter((p) => p.partyId === 'P00000002');
    assert.equal(allB.length, 2);
  });

  it('KEY044 keeps same sub-publisher under different E parents', () => {
    const result = parseCwr(readFixture('BC-key044.V22'));
    const parties = result.works[0].parties || [];
    const allE = collectParties(parties).filter((p) => p.partyId === 'P00000006');
    assert.equal(allE.length, 2);
  });
});
