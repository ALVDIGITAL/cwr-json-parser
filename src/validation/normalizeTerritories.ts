type ShareTypeBlock = {
  type?: string;
  shares?: unknown[];
};

type TerritoryEntry = {
  territory?: { include?: string[]; exclude?: string[] };
  shareTypes?: ShareTypeBlock[];
  agreementNumber?: { source?: string; value: string };
};

import { isSubPublisherRole } from '../cwr-sdk/lookups';

type ParticipantLike = {
  role?: string;
  territories?: TerritoryEntry[];
  representedBy?: ParticipantLike[];
};

function cloneTerritoryEntry(entry: TerritoryEntry): TerritoryEntry {
  return {
    ...entry,
    territory: {
      include: [...(entry.territory?.include || [])],
      exclude: [...(entry.territory?.exclude || [])],
    },
    shareTypes: (entry.shareTypes || []).map((st) => ({
      ...st,
      shares: Array.isArray(st.shares) ? [...st.shares] : st.shares,
    })),
    ...(entry.agreementNumber ? { agreementNumber: { ...entry.agreementNumber } } : {}),
  };
}

function territorySignature(entry: TerritoryEntry): string {
  const inc = (entry.territory?.include || []).join(',');
  const exc = (entry.territory?.exclude || []).join(',');
  const types = (entry.shareTypes || []).map((st) => st.type).join('+');
  return `${inc}|${exc}|${types}`;
}

function splitMixedTerritoryEntry(entry: TerritoryEntry): TerritoryEntry[] {
  const shareTypes = entry.shareTypes || [];
  const ownBlock = shareTypes.find((st) => st.type === 'own');
  const collBlocks = shareTypes.filter((st) => st.type === 'coll');
  const otherBlocks = shareTypes.filter((st) => st.type !== 'own' && st.type !== 'coll');
  const include = entry.territory?.include || [];
  const exclude = entry.territory?.exclude || [];
  const hasTis = include.length > 0 || exclude.length > 0;

  if (!ownBlock) {
    return [entry];
  }

  const hasColl = collBlocks.length > 0 || otherBlocks.length > 0;
  const mustSplit = hasColl || hasTis || shareTypes.length > 1;

  if (!mustSplit) {
    return [entry];
  }

  const rows: TerritoryEntry[] = [
    {
      territory: { include: [], exclude: [] },
      shareTypes: [ownBlock],
      agreementNumber: entry.agreementNumber,
    },
  ];

  if (hasColl) {
    rows.push({
      territory: { include: [...include], exclude: [...exclude] },
      shareTypes: [...collBlocks, ...otherBlocks],
      agreementNumber: entry.agreementNumber,
    });
  }

  return rows;
}

function stripSubPublisherOwnership(party: ParticipantLike, notes: string[], path: string) {
  if (!party.role || !isSubPublisherRole(party.role)) return;

  let removed = false;
  for (const entry of party.territories || []) {
    const before = entry.shareTypes?.length || 0;
    entry.shareTypes = (entry.shareTypes || []).filter((st) => st.type !== 'own');
    if ((entry.shareTypes?.length || 0) < before) removed = true;
  }
  party.territories = (party.territories || []).filter((t) => (t.shareTypes?.length || 0) > 0);

  if (removed) {
    notes.push(
      `${path}: removed ownership (own) shares for sub-publisher role ${party.role} (collection only in CWR-JSON)`
    );
  }
}

function normalizePartyTerritories(party: ParticipantLike, notes: string[], path: string) {
  stripSubPublisherOwnership(party, notes, path);

  const territories = party.territories || [];
  const next: TerritoryEntry[] = [];

  territories.forEach((entry, index) => {
    const before = territorySignature(entry);
    const split = splitMixedTerritoryEntry(cloneTerritoryEntry(entry));
    const after = split.map(territorySignature).join('||');
    if (before !== after) {
      notes.push(
        `${path}/territories/${index}: split combined ownership (own) and collection (coll) into separate entries`
      );
    }
    next.push(...split);
  });

  party.territories = next;

  stripSubPublisherOwnership(party, notes, path);

  for (let i = 0; i < (party.representedBy || []).length; i++) {
    normalizePartyTerritories(party.representedBy![i], notes, `${path}/representedBy/${i}`);
  }
}

/** Split combined own+coll territory rows to match CWR-JSON layout. */
export function normalizeTerritoriesOnDocument(
  works: { parties?: ParticipantLike[] }[],
  notes: string[]
): void {
  works.forEach((work, wi) => {
    (work.parties || []).forEach((party, pi) => {
      normalizePartyTerritories(party, notes, `/works/${wi}/parties/${pi}`);
    });
  });
}
