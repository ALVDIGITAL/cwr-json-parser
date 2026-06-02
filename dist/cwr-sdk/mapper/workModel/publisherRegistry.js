"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublisherRegistry = void 0;
const parseHelpers_1 = require("./parseHelpers");
/** Indexes publisher chains for PWR/SPT resolution without global mutable pointers. */
class PublisherRegistry {
    constructor() {
        this.byIp = {};
        this.bySequence = {};
        this.bySeqAndIp = {};
        this.chains = [];
    }
    addChain(chain) {
        this.chains.push(chain);
        const { party, sequence } = chain;
        const role = party.role;
        if (sequence) {
            this.bySequence[sequence] = party;
            if (party.partyId) {
                this.registerSeqAndIp(sequence, party.partyId, party);
            }
        }
        this.registerByIp(party.partyId, party, role);
        for (const sub of party.representedBy) {
            this.registerByIp(sub.partyId, sub, sub.role);
            if (sequence && sub.partyId) {
                this.registerSeqAndIp(sequence, sub.partyId, sub);
            }
        }
    }
    registerByIp(key, participant, role) {
        if (!key)
            return;
        if (!this.byIp[key] || role === 'E') {
            this.byIp[key] = participant;
        }
        const normalized = (0, parseHelpers_1.normalizePartyKey)(key);
        if (normalized && (!this.byIp[normalized] || role === 'E')) {
            this.byIp[normalized] = participant;
        }
    }
    registerSeqAndIp(seq, partyId, participant) {
        this.bySeqAndIp[`${seq}|${partyId}`] = participant;
        const normalized = (0, parseHelpers_1.normalizePartyKey)(partyId);
        if (normalized)
            this.bySeqAndIp[`${seq}|${normalized}`] = participant;
    }
    resolveByKey(key) {
        if (!key)
            return null;
        return this.byIp[key] || this.byIp[(0, parseHelpers_1.normalizePartyKey)(key)] || null;
    }
    resolveForPwr(seq, pubIp) {
        const seqKey = (0, parseHelpers_1.normalizeSequenceKey)(seq);
        const ip = (pubIp || '').trim();
        if (seqKey && ip) {
            const byComposite = this.bySeqAndIp[`${seqKey}|${ip}`] ||
                this.bySeqAndIp[`${seqKey}|${(0, parseHelpers_1.normalizePartyKey)(ip)}`];
            if (byComposite)
                return byComposite;
        }
        if (seqKey && this.bySequence[seqKey]) {
            return this.bySequence[seqKey];
        }
        return this.resolveByKey(pubIp);
    }
    /** Party on a chain that should receive the next SPT (sub-publisher or E). */
    activePartyOnChain(chain) {
        const subs = chain.party.representedBy;
        if (subs.length > 0)
            return subs[subs.length - 1];
        return chain.party;
    }
    findChainForParty(party) {
        return this.chains.find((c) => c.party === party || c.party.representedBy.includes(party));
    }
    allPublisherParties() {
        const seen = new Set();
        const out = [];
        for (const chain of this.chains) {
            if (!seen.has(chain.party)) {
                seen.add(chain.party);
                out.push(chain.party);
            }
            for (const sub of chain.party.representedBy) {
                if (!seen.has(sub)) {
                    seen.add(sub);
                    out.push(sub);
                }
            }
        }
        return out;
    }
}
exports.PublisherRegistry = PublisherRegistry;
//# sourceMappingURL=publisherRegistry.js.map