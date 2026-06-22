export type ShareEntry = {
  rightsType: 'pr' | 'mr' | 'sr';
  value: number;
  society?: string;
};

export type AgreementNumber = { source?: string; value: string };

export function findOrCreateTerritoryEntry(
  participant: any,
  include: string[],
  exclude: string[]
): any {
  participant.territories = participant.territories || [];

  const key = `I:${include.sort().join(',')}_E:${exclude.sort().join(',')}`;
  let entry = participant.territories.find((t: any) => {
    const tKey = `I:${(t.territory.include || []).sort().join(',')}_E:${(t.territory.exclude || []).sort().join(',')}`;
    return tKey === key;
  });

  if (!entry) {
    entry = {
      territory: {
        include: include.length ? include : [],
        exclude: exclude.length ? exclude : [],
      },
      shareTypes: [],
      agreementNumber: participant._agreementNumber,
    };
    participant.territories.push(entry);
  }

  return entry;
}

export function addShareType(
  territoryEntry: any,
  type: 'own' | 'coll',
  shares: ShareEntry[]
) {
  const filtered = (shares || []).filter((s) => s.value > 0);
  if (!filtered.length) return;

  let shareTypeEntry = territoryEntry.shareTypes.find((st: any) => st.type === type);

  if (!shareTypeEntry) {
    shareTypeEntry = { type, shares: [] };
    territoryEntry.shareTypes.push(shareTypeEntry);
  }

  shareTypeEntry.shares = filtered;
}

export function normalizeSharesKey(shares: ShareEntry[] = []) {
  return shares
    .filter((s) => s.value > 0)
    .map((s) => `${s.rightsType || ''}:${s.value ?? ''}:${s.society || ''}`)
    .sort()
    .join('|');
}

function getNonZeroCollShares(territoryEntry: any): ShareEntry[] {
  const coll = (territoryEntry.shareTypes || []).find((st: any) => st.type === 'coll');
  return (coll?.shares || []).filter((s: ShareEntry) => s.value > 0);
}

function findCollTerritoryByShareKey(participant: any, shareKey: string): any | undefined {
  if (!shareKey) return undefined;
  return (participant.territories || []).find((t: any) => {
    const nonZero = getNonZeroCollShares(t);
    return nonZero.length > 0 && normalizeSharesKey(nonZero) === shareKey;
  });
}

function findPendingCollTerritory(participant: any): any | undefined {
  return (participant.territories || []).find((t: any) => {
    const hasTis =
      (t.territory?.include?.length || 0) > 0 || (t.territory?.exclude?.length || 0) > 0;
    return hasTis && getNonZeroCollShares(t).length === 0;
  });
}

function findLastCollTerritoryWithShares(participant: any): any | undefined {
  const territories = participant.territories || [];
  for (let i = territories.length - 1; i >= 0; i--) {
    if (getNonZeroCollShares(territories[i]).length > 0) {
      return territories[i];
    }
  }
  return undefined;
}

function mergeTis(territoryEntry: any, incl: boolean, tis: string[]) {
  if (incl) {
    territoryEntry.territory.include = Array.from(
      new Set([...(territoryEntry.territory.include || []), ...tis])
    );
  } else {
    territoryEntry.territory.exclude = Array.from(
      new Set([...(territoryEntry.territory.exclude || []), ...tis])
    );
  }
}

/** Ownership shares are global to the party — not scoped to TIS include/exclude. */
export function upsertOwnTerritory(
  participant: any,
  ownShares: ShareEntry[],
  agreementNumber?: AgreementNumber
) {
  if (!ownShares?.length) return null;
  const ownTerritory = findOrCreateTerritoryEntry(participant, [], []);
  addShareType(ownTerritory, 'own', ownShares);
  if (agreementNumber) ownTerritory.agreementNumber = agreementNumber;
  return ownTerritory;
}

export function upsertCollectionTerritory(
  participant: any,
  options: {
    incl: boolean;
    tis: string[];
    collShares: ShareEntry[];
    agreementNumber?: AgreementNumber;
  }
) {
  const { incl, tis, collShares, agreementNumber } = options;
  const nonZeroShares = (collShares || []).filter((s) => s.value > 0);
  const shareKey = normalizeSharesKey(nonZeroShares);
  const isScopeOnly = tis.length > 0 && nonZeroShares.length === 0;

  let territoryEntry: any;

  if (nonZeroShares.length > 0) {
    territoryEntry =
      findCollTerritoryByShareKey(participant, shareKey) ||
      findPendingCollTerritory(participant);

    if (!territoryEntry) {
      territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
    } else {
      mergeTis(territoryEntry, incl, tis);
    }

    addShareType(territoryEntry, 'coll', nonZeroShares);
    participant._activeCollTerritory = territoryEntry;
  } else if (isScopeOnly) {
    territoryEntry =
      participant._activeCollTerritory ||
      findLastCollTerritoryWithShares(participant) ||
      findPendingCollTerritory(participant);

    if (!territoryEntry) {
      territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
    } else {
      mergeTis(territoryEntry, incl, tis);
    }
  } else {
    return null;
  }

  if (agreementNumber) {
    territoryEntry.agreementNumber = agreementNumber;
  }

  return territoryEntry;
}
