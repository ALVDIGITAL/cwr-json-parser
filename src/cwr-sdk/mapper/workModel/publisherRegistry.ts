import type { PartyNode, PublisherChain } from './types';
import { normalizePartyKey, normalizeSequenceKey } from './parseHelpers';

/** Indexes publisher chains for PWR/SPT resolution without global mutable pointers. */
export class PublisherRegistry {
  private readonly byIp: Record<string, PartyNode> = {};
  private readonly bySequence: Record<string, PartyNode> = {};
  private readonly bySeqAndIp: Record<string, PartyNode> = {};
  readonly chains: PublisherChain[] = [];

  addChain(chain: PublisherChain) {
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

  private registerByIp(key: string, participant: PartyNode, role: string) {
    if (!key) return;
    if (!this.byIp[key] || role === 'E') {
      this.byIp[key] = participant;
    }
    const normalized = normalizePartyKey(key);
    if (normalized && (!this.byIp[normalized] || role === 'E')) {
      this.byIp[normalized] = participant;
    }
  }

  private registerSeqAndIp(seq: string, partyId: string, participant: PartyNode) {
    this.bySeqAndIp[`${seq}|${partyId}`] = participant;
    const normalized = normalizePartyKey(partyId);
    if (normalized) this.bySeqAndIp[`${seq}|${normalized}`] = participant;
  }

  resolveByKey(key?: string): PartyNode | null {
    if (!key) return null;
    return this.byIp[key] || this.byIp[normalizePartyKey(key)] || null;
  }

  resolveForPwr(seq?: string, pubIp?: string): PartyNode | null {
    const seqKey = normalizeSequenceKey(seq);
    const ip = (pubIp || '').trim();
    if (seqKey && ip) {
      const byComposite =
        this.bySeqAndIp[`${seqKey}|${ip}`] ||
        this.bySeqAndIp[`${seqKey}|${normalizePartyKey(ip)}`];
      if (byComposite) return byComposite;
    }
    if (seqKey && this.bySequence[seqKey]) {
      return this.bySequence[seqKey];
    }
    return this.resolveByKey(pubIp);
  }

  /** Party on a chain that should receive the next SPT (sub-publisher or E). */
  activePartyOnChain(chain: PublisherChain): PartyNode {
    const subs = chain.party.representedBy;
    if (subs.length > 0) return subs[subs.length - 1];
    return chain.party;
  }

  findChainForParty(party: PartyNode): PublisherChain | undefined {
    return this.chains.find((c) => c.party === party || c.party.representedBy.includes(party));
  }

  allPublisherParties(): PartyNode[] {
    const seen = new Set<PartyNode>();
    const out: PartyNode[] = [];
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
