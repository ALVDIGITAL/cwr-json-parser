import type { PartyNode, PublisherChain } from './types';
/** Indexes publisher chains for PWR/SPT resolution without global mutable pointers. */
export declare class PublisherRegistry {
    private readonly byIp;
    private readonly bySequence;
    private readonly bySeqAndIp;
    readonly chains: PublisherChain[];
    addChain(chain: PublisherChain): void;
    private registerByIp;
    private registerSeqAndIp;
    resolveByKey(key?: string): PartyNode | null;
    resolveForPwr(seq?: string, pubIp?: string): PartyNode | null;
    /** Party on a chain that should receive the next SPT (sub-publisher or E). */
    activePartyOnChain(chain: PublisherChain): PartyNode;
    findChainForParty(party: PartyNode): PublisherChain | undefined;
    allPublisherParties(): PartyNode[];
}
//# sourceMappingURL=publisherRegistry.d.ts.map