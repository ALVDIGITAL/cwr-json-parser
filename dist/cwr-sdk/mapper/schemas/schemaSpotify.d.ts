import type { CwrJsonSchema } from '../schemaTypes';
export interface SpotifyManuEntry {
    role?: string;
    name?: string;
    ipi?: string;
    partyId?: string;
}
export interface SchemaSpotifyWorkOutput {
    messages: Record<string, unknown>;
    flags?: Record<string, unknown>;
    titles?: unknown[];
    identifiers?: unknown[];
    recordings?: unknown[];
    manu?: SpotifyManuEntry[];
}
export interface SchemaSpotifyOutput {
    header?: Record<string, unknown>;
    works: SchemaSpotifyWorkOutput[];
}
export declare const schemaSpotify: CwrJsonSchema<SchemaSpotifyOutput>;
//# sourceMappingURL=schemaSpotify.d.ts.map