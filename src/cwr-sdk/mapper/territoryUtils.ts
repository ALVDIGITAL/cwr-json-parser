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
  if (!shares || shares.length === 0) return;

  let shareTypeEntry = territoryEntry.shareTypes.find((st: any) => st.type === type);

  if (!shareTypeEntry) {
    shareTypeEntry = { type, shares: [] };
    territoryEntry.shareTypes.push(shareTypeEntry);
  }

  shareTypeEntry.shares = shares;
}

export function normalizeSharesKey(shares: ShareEntry[] = []) {
  return shares
    .map((s) => `${s.rightsType || ''}:${s.value ?? ''}:${s.society || ''}`)
    .sort()
    .join('|');
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
  const collSharesKey = normalizeSharesKey(collShares || []);
  const hasAnyCollShares = (collShares || []).length > 0;

  let territoryEntry = (participant.territories || []).find((t: any) => {
    const existingColl =
      (t.shareTypes || []).find((st: any) => st.type === 'coll')?.shares || [];
    if (!existingColl.length && !hasAnyCollShares) return false;
    return normalizeSharesKey(existingColl) === collSharesKey;
  });

  if (!territoryEntry) {
    territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
  } else if (incl) {
    territoryEntry.territory.include = Array.from(
      new Set([...(territoryEntry.territory.include || []), ...tis])
    );
  } else {
    territoryEntry.territory.exclude = Array.from(
      new Set([...(territoryEntry.territory.exclude || []), ...tis])
    );
  }

  if (hasAnyCollShares) {
    addShareType(territoryEntry, 'coll', collShares);
  }
  if (agreementNumber) {
    territoryEntry.agreementNumber = agreementNumber;
  }

  return territoryEntry;
}
