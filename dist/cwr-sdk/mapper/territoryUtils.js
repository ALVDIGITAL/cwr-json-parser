"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateTerritoryEntry = findOrCreateTerritoryEntry;
exports.addShareType = addShareType;
exports.normalizeSharesKey = normalizeSharesKey;
exports.upsertOwnTerritory = upsertOwnTerritory;
exports.upsertCollectionTerritory = upsertCollectionTerritory;
function findOrCreateTerritoryEntry(participant, include, exclude) {
    participant.territories = participant.territories || [];
    const key = `I:${include.sort().join(',')}_E:${exclude.sort().join(',')}`;
    let entry = participant.territories.find((t) => {
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
function addShareType(territoryEntry, type, shares) {
    if (!shares || shares.length === 0)
        return;
    let shareTypeEntry = territoryEntry.shareTypes.find((st) => st.type === type);
    if (!shareTypeEntry) {
        shareTypeEntry = { type, shares: [] };
        territoryEntry.shareTypes.push(shareTypeEntry);
    }
    shareTypeEntry.shares = shares;
}
function normalizeSharesKey(shares = []) {
    return shares
        .map((s) => `${s.rightsType || ''}:${s.value ?? ''}:${s.society || ''}`)
        .sort()
        .join('|');
}
function upsertOwnTerritory(participant, ownShares, agreementNumber) {
    if (!ownShares?.length)
        return null;
    const ownTerritory = findOrCreateTerritoryEntry(participant, [], []);
    addShareType(ownTerritory, 'own', ownShares);
    if (agreementNumber)
        ownTerritory.agreementNumber = agreementNumber;
    return ownTerritory;
}
function upsertCollectionTerritory(participant, options) {
    const { incl, tis, collShares, agreementNumber } = options;
    const collSharesKey = normalizeSharesKey(collShares || []);
    const hasAnyCollShares = (collShares || []).length > 0;
    let territoryEntry = (participant.territories || []).find((t) => {
        const existingColl = (t.shareTypes || []).find((st) => st.type === 'coll')?.shares || [];
        if (!existingColl.length && !hasAnyCollShares)
            return false;
        return normalizeSharesKey(existingColl) === collSharesKey;
    });
    if (!territoryEntry) {
        territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
    }
    else if (incl) {
        territoryEntry.territory.include = Array.from(new Set([...(territoryEntry.territory.include || []), ...tis]));
    }
    else {
        territoryEntry.territory.exclude = Array.from(new Set([...(territoryEntry.territory.exclude || []), ...tis]));
    }
    if (hasAnyCollShares) {
        addShareType(territoryEntry, 'coll', collShares);
    }
    if (agreementNumber) {
        territoryEntry.agreementNumber = agreementNumber;
    }
    return territoryEntry;
}
//# sourceMappingURL=territoryUtils.js.map