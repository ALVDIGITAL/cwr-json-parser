export type ShareEntry = {
    rightsType: 'pr' | 'mr' | 'sr';
    value: number;
    society?: string;
};
export type AgreementNumber = {
    source?: string;
    value: string;
};
export declare function findOrCreateTerritoryEntry(participant: any, include: string[], exclude: string[]): any;
export declare function addShareType(territoryEntry: any, type: 'own' | 'coll', shares: ShareEntry[]): void;
export declare function normalizeSharesKey(shares?: ShareEntry[]): string;
export declare function upsertOwnTerritory(participant: any, ownShares: ShareEntry[], agreementNumber?: AgreementNumber): any;
export declare function upsertCollectionTerritory(participant: any, options: {
    incl: boolean;
    tis: string[];
    collShares: ShareEntry[];
    agreementNumber?: AgreementNumber;
}): any;
//# sourceMappingURL=territoryUtils.d.ts.map