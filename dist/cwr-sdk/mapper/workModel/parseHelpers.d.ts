import type { ShareEntry } from '../territoryUtils';
export declare function lineToObj(line: string): Record<string, string>;
export declare function parseShares(obj: Record<string, string>, prKey: string, mrKey: string, srKey: string, defaultSociety?: string): ShareEntry[];
export declare function normalizePartyKey(value?: string): string;
export declare function normalizeSequenceKey(seq?: string): string;
export declare function isPublisherOwnEligible(role?: string): boolean;
//# sourceMappingURL=parseHelpers.d.ts.map