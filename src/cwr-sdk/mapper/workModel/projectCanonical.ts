import type { ParsedCwrFile } from '../../types/cwr';
import { upsertCollectionTerritory, upsertOwnTerritory } from '../territoryUtils';
import { isPublisherOwnEligible } from './parseHelpers';
import { buildWorkModel, createCombinedPublisherRegistry } from './buildWorkModel';
import type { WorkModel, WriterGroup, PartyNode } from './types';
import { PublisherRegistry } from './publisherRegistry';

export function projectCanonicalFromModel(model: WorkModel): ParsedCwrFile {
  const submitterRegistry = new PublisherRegistry();
  for (const chain of model.submitterPublisherChains) {
    submitterRegistry.addChain(chain);
  }
  const otherRegistry = new PublisherRegistry();
  for (const chain of model.otherPublisherChains) {
    otherRegistry.addChain(chain);
  }
  const combinedRegistry = createCombinedPublisherRegistry(model);

  const linkedPublishers = new Set<PartyNode>();
  const interestedParties: PartyNode[] = [];

  const linkWriterGroups = (
    groups: WriterGroup[],
    registry: PublisherRegistry
  ) => {
    for (const group of groups) {
      const writer = group.writer;
      interestedParties.push(writer);

      for (const coll of group.collectionTerritories) {
        upsertCollectionTerritory(writer, coll);
      }

      for (const link of group.pwrLinks) {
        const pub = registry.resolveForPwr(link.publisherSequence, link.pubIp);
        if (!pub) continue;
        writer.representedBy = writer.representedBy || [];
        if (!writer.representedBy.includes(pub)) {
          writer.representedBy.push(pub);
        }
        linkedPublishers.add(pub);
      }
    }
  };

  linkWriterGroups(model.controlledWriterGroups, submitterRegistry);
  linkWriterGroups(model.otherWriterGroups, otherRegistry);

  applyGemaRoleSplits(model, interestedParties);
  attachLocalNames(model, interestedParties, combinedRegistry);

  const cleanupParticipant = (p: PartyNode) => {
    const isPublisher = p._isPublisher === true;
    const ownAllowed = !isPublisher || isPublisherOwnEligible(p.role);
    if (ownAllowed && p._ownShares?.length) {
      upsertOwnTerritory(p, p._ownShares, p._agreementNumber);
    }

    delete p._isPublisher;
    delete p._ownShares;
    delete p._agreementNumber;
    delete p._publisherSequence;
    if (p.representedBy?.length) p.representedBy.forEach(cleanupParticipant);
  };

  interestedParties.forEach(cleanupParticipant);

  const uniquePublishers = combinedRegistry.allPublisherParties();
  uniquePublishers.forEach(cleanupParticipant);

  for (const publisher of uniquePublishers) {
    if (publisher.role === 'E' && !linkedPublishers.has(publisher)) {
      if (!interestedParties.includes(publisher)) {
        interestedParties.push(publisher);
      }
    }
  }

  const header =
    Object.keys(model.header).length > 0 ? model.header : undefined;

  return {
    header,
    works: [
      {
        messages: model.messages,
        titles: model.titles,
        identifiers: model.identifiers,
        flags: model.flags,
        parties: interestedParties,
        recordings: model.recordings,
      } as ParsedCwrFile['works'][0],
    ],
  };
}

function applyGemaRoleSplits(model: WorkModel, parties: PartyNode[]) {
  for (const ari of model.ariRecords) {
    if (ari.societyCode !== '035' || ari.subjectCode !== 'GW' || !ari.note) continue;
    const note = ari.note.trim();

    const typeMMatch = note.match(/^M\|(\d{5})\|T\|(\d{5})$/);
    if (typeMMatch) {
      const music = parseInt(typeMMatch[1], 10) / 100;
      const text = parseInt(typeMMatch[2], 10) / 100;
      for (const party of parties) {
        if (party.role === 'CA') {
          party.roleSplitM = music;
          party.roleSplitT = text;
        }
      }
    }

    const typeCMatch = note.match(/^C\|(\d{5})\|A\|(\d{5})\|C(\d+)\|(.+)$/);
    if (typeCMatch) {
      const composerPct = parseInt(typeCMatch[1], 10) / 100;
      const authorPct = parseInt(typeCMatch[2], 10) / 100;
      const creatorIp = typeCMatch[3];
      const creatorName = typeCMatch[4];
      for (const party of parties) {
        if (party.role === 'CA') {
          const ipMatch = party.partyId?.includes(creatorIp);
          const nameMatch = party.name?.toUpperCase().includes(creatorName.toUpperCase());
          if (ipMatch || nameMatch) {
            party.roleSplitM = composerPct;
            party.roleSplitT = authorPct;
          }
        }
      }
    }
  }
}

function attachLocalNames(
  model: WorkModel,
  parties: PartyNode[],
  registry: PublisherRegistry
) {
  for (const party of parties) {
    if (party.partyId && model.writerLocalNames[party.partyId]) {
      party.nameDomestic = model.writerLocalNames[party.partyId].name;
      if (model.writerLocalNames[party.partyId].language) {
        party.nameScript = model.writerLocalNames[party.partyId].language;
      }
    }
  }

  for (const publisher of registry.allPublisherParties()) {
    const ip = publisher.partyId;
    if (!ip) continue;
    const localizedName =
      model.publisherLocalNames[ip] ||
      model.publisherLocalNames[ip.replace(/^0+/, '')];
    if (localizedName) {
      publisher.nameDomestic = localizedName.name;
      if (localizedName.language) {
        publisher.nameScript = localizedName.language;
      }
    }
  }
}

export function toCanonicalFromLines(lines: string[]): ParsedCwrFile {
  const model = buildWorkModel(lines);
  return projectCanonicalFromModel(model);
}
