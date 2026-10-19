import { upsertCollectionTerritory, upsertOwnTerritory } from '../territoryUtils';
import {
  lineToObj,
  parseShares,
  normalizeSequenceKey,
  normalizePartyKey,
  isPublisherOwnEligible,
  mapXrfToIdentifier,
  pushIdentifier,
  pushIswc,
} from './parseHelpers';
import { formatIswcForValidation } from '../../../validation/normalizeIswc';
import { PublisherRegistry } from './publisherRegistry';
import type {
  WorkModel,
  PartyNode,
  PublisherChain,
  WriterGroup,
  CollectionTerritoryInput,
  PwrLink,
} from './types';

type PublisherBlock = 'submitter' | 'other';

export function buildWorkModel(lines: string[]): WorkModel {
  const model: WorkModel = {
    header: {},
    messages: {},
    flags: {},
    identifiers: [],
    titles: [],
    recordings: [],
    ariRecords: [],
    writerLocalNames: {},
    publisherLocalNames: {},
    submitterPublisherChains: [],
    otherPublisherChains: [],
    controlledWriterGroups: [],
    otherWriterGroups: [],
  };

  const submitterRegistry = new PublisherRegistry();
  const otherRegistry = new PublisherRegistry();
  let currentPublisherBlock: PublisherBlock = 'submitter';
  let currentPublisherChain: PublisherChain | null = null;
  let currentWriterGroup: WriterGroup | null = null;
  let currentWriterBlock: 'controlled' | 'other' = 'controlled';

  const chainsForBlock = (block: PublisherBlock) =>
    block === 'submitter' ? model.submitterPublisherChains : model.otherPublisherChains;

  const registryForBlock = (block: PublisherBlock) =>
    block === 'submitter' ? submitterRegistry : otherRegistry;

  const writerGroupsForBlock = (block: 'controlled' | 'other') =>
    block === 'controlled' ? model.controlledWriterGroups : model.otherWriterGroups;

  const createPublisherParty = (
    obj: Record<string, string>,
    recordType: 'SPU' | 'OPU',
    sequenceOverride?: string
  ): PartyNode => {
    const partyNumber = (obj.InterestedPartyNumber || '').trim();
    const ipiNameNumber = (obj.IPInameNumber || '').trim();
    const ip = partyNumber || ipiNameNumber;
    const role = obj.PublisherType || 'E';
    const name = obj.PublisherName || '';
    const ipi = obj.IPInameNumber || obj.IPIBaseNumber || '';
    const sequence = sequenceOverride ?? normalizeSequenceKey(obj.PublisherSequence);
    const agreementNumber =
      obj.SubmitterAgreementNumber || obj.SocietyAssignedAgreementNumber || undefined;
    const defaultSociety =
      obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const controlled = recordType === 'SPU' ? 'yes' : 'no';

    const ownShares = parseShares(
      obj,
      'PROwnershipShare',
      'MROwnershipShare',
      'SROwnershipShare',
      defaultSociety
    );

    const party: PartyNode = {
      role,
      name,
      ipi,
      partyId: ip,
      controlled,
      _isPublisher: true,
      _publisherSequence: sequence || undefined,
      _agreementNumber: agreementNumber
        ? { source: defaultSociety || undefined, value: agreementNumber }
        : undefined,
      _ownShares: ownShares,
      territories: [],
      representedBy: [],
    };

    if (isPublisherOwnEligible(role)) {
      upsertOwnTerritory(
        party,
        ownShares,
        agreementNumber ? { source: defaultSociety || undefined, value: agreementNumber } : undefined
      );
    }

    return party;
  };

  const handleSpuOpu = (type: 'SPU' | 'OPU', obj: Record<string, string>) => {
    const block: PublisherBlock = type === 'SPU' ? 'submitter' : 'other';
    currentPublisherBlock = block;
    const role = obj.PublisherType || 'E';
    const sequence = normalizeSequenceKey(obj.PublisherSequence);
    const recordSeq = obj.RecordSeq || '';
    const controlled = type === 'SPU' ? 'yes' : 'no';
    const registry = registryForBlock(block);
    const chains = chainsForBlock(block);

    if (role === 'E') {
      const party = createPublisherParty(obj, type, sequence);
      const chain: PublisherChain = { sequence, recordSeq, controlled, party };
      chains.push(chain);
      registry.addChain(chain);
      currentPublisherChain = chain;
      return;
    }

    if (['SE', 'AM', 'PA'].includes(role) && currentPublisherChain) {
      const partyId = (obj.InterestedPartyNumber || '').trim();
      const normalizedId = normalizePartyKey(partyId);
      const existing = currentPublisherChain.party.representedBy.find(
        (sub) =>
          sub.partyId === partyId || normalizePartyKey(sub.partyId) === normalizedId
      );
      if (existing) {
        registry.addChain(currentPublisherChain);
        return;
      }
      const sub = createPublisherParty(obj, type, currentPublisherChain.sequence);
      currentPublisherChain.party.representedBy.push(sub);
      registry.addChain(currentPublisherChain);
      return;
    }

    const party = createPublisherParty(obj, type, sequence);
    const chain: PublisherChain = { sequence, recordSeq, controlled, party };
    chains.push(chain);
    registry.addChain(chain);
    currentPublisherChain = chain;
  };

  const applyPublisherTerritory = (
    block: PublisherBlock,
    obj: Record<string, string>,
    recordType: 'SPT' | 'OPT'
  ) => {
    const ip = obj.InterestedPartyNumber || '';
    const incl = obj.InclusionExclusionIndicator === 'I';
    const tis = obj.TISNumericCode ? [obj.TISNumericCode] : [];
    const agreement = (obj.SubmitterAgreementNumber || obj.SocietyAssignedAgreementNumber || '').trim();
    const defaultSociety =
      obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const collShares = parseShares(obj, 'PRCollectionShare', 'MRCollectionShare', 'SRCollectionShare');

    const registry = registryForBlock(block);
    let target =
      registry.resolveByKey(ip) ||
      (currentPublisherChain ? registry.activePartyOnChain(currentPublisherChain) : null);

    if (!target) return;

    upsertCollectionTerritory(target, {
      incl,
      tis,
      collShares,
      agreementNumber: agreement
        ? { source: defaultSociety || undefined, value: agreement }
        : undefined,
    });
  };

  const startWriterGroup = (type: 'SWR' | 'OWR', obj: Record<string, string>) => {
    const block: 'controlled' | 'other' = type === 'SWR' ? 'controlled' : 'other';
    currentWriterBlock = block;

    const ip = obj.InterestedPartyNumber || '';
    const role = obj.WriterDesignationCode || 'C';
    const name =
      [obj.WriterFirstName, obj.WriterLastName].filter(Boolean).join(' ').trim() ||
      obj.WriterLastName ||
      '';
    const ipi = obj.IPINameNumber || obj.IPIBaseNumber || obj.IPInameNumber || '';
    const defaultSociety =
      obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const controlled = type === 'SWR' ? 'yes' : 'no';
    const ownShares = parseShares(
      obj,
      'PROwnershipShare',
      'MROwnershipShare',
      'SROwnershipShare',
      defaultSociety
    );

    const writer: PartyNode = {
      role,
      name,
      ipi,
      partyId: ip,
      controlled,
      _isPublisher: false,
      _ownShares: ownShares,
      territories: [],
      representedBy: [],
    };

    upsertOwnTerritory(writer, ownShares);

    const group: WriterGroup = {
      writer,
      collectionTerritories: [],
      pwrLinks: [],
    };

    writerGroupsForBlock(block).push(group);
    currentWriterGroup = group;
  };

  const handleWriterTerritory = (obj: Record<string, string>) => {
    if (!currentWriterGroup) return;
    const incl = obj.InclusionExclusionIndicator === 'I';
    const tis = obj.TISNumericCode ? [obj.TISNumericCode] : [];
    const collShares = parseShares(obj, 'PRCollectionShare', 'MRCollectionShare', 'SRCollectionShare');

    const input: CollectionTerritoryInput = { incl, tis, collShares };
    currentWriterGroup.collectionTerritories.push(input);
  };

  const handlePwr = (obj: Record<string, string>) => {
    if (!currentWriterGroup) return;

    const writerIp = obj.WriterIPNumber || '';
    const pubIp = obj.PublisherIPNumber || '';
    const publisherSequence = normalizeSequenceKey(obj.PublisherSequenceNumber);

    const link: PwrLink = { writerIp, pubIp, publisherSequence };

    if (obj.RelinquishmentIndicator === 'Y' && pubIp) {
      const registry =
        currentWriterBlock === 'controlled' ? submitterRegistry : otherRegistry;
      const pub = registry.resolveForPwr(publisherSequence, pubIp);
      if (pub) {
        const rightsTypes: string[] = [];
        if (obj.RelinquishmentPR === 'Y') rightsTypes.push('pr');
        if (obj.RelinquishmentMR === 'Y') rightsTypes.push('mr');
        if (obj.RelinquishmentSR === 'Y') rightsTypes.push('sr');
        pub.relinquishment = {
          effectiveFrom: obj.RelinquishmentEffectiveDate || '',
          postTermCollectionUntil: obj.PostTermCollectionDate || undefined,
          scope: {
            rightsTypes,
            territories: {
              include:
                obj.RelinquishmentTerritoryIndicator === 'I'
                  ? [obj.RelinquishmentTerritoryCode]
                  : [],
              exclude:
                obj.RelinquishmentTerritoryIndicator === 'E'
                  ? [obj.RelinquishmentTerritoryCode]
                  : [],
            },
          },
          note: 'E publisher stops representing this writer for the specified scope.',
        };
      }
    }

    currentWriterGroup.pwrLinks.push(link);
  };

  for (const line of lines) {
    const type = line.substring(0, 3);
    const obj = lineToObj(line);

    if (type === 'HDR') {
      model.header = {
        senderIdentifier: obj.SenderIdentifier || undefined,
        senderName: obj.SenderName || undefined,
        creationDate: obj.CreationDate || undefined,
        creationTime: obj.CreationTime || undefined,
        version: obj.Version || undefined,
        softwarePackage: obj.SoftwarePackage || undefined,
      };
      continue;
    }

    if (type === 'ACK') {
      model.messages.type = 'ack';
      model.messages.creationDate = (obj.CreationDate || '').trim();
      model.messages.creationTime = (obj.CreationTime || '').trim();
      model.messages.originalGroupId = (obj.OriginalGroupId || '').trim();
      model.messages.originalTransactionSequence = (obj.OriginalTransactionSeq || '').trim();
      model.messages.originalTransactionType = (obj.OriginalTransactionType || '').trim();
      model.messages.creationTitle = (obj.CreationTitle || '').trim();
      model.messages.submitterCreationNumber = (obj.SubmitterCreationNumber || '').trim();
      model.messages.recipientCreationNumber = (obj.RecipientCreationNumber || '').trim();
      model.messages.processingDate = (obj.ProcessingDate || '').trim();
      model.messages.transactionStatus = (obj.TransactionStatus || '').trim();
      continue;
    }

    if (type === 'MSG') {
      const msgs = (model.messages.msgs as any[]) || [];
      msgs.push({
        status: (obj.MessageType || '').trim(),
        message: (obj.MessageText || '').trim(),
        originalRecordSequence: (obj.OriginalRecordSequence || '').trim(),
        recordType: (obj.MessageRecordType || '').trim(),
        messageLevel: (obj.MessageLevel || '').trim(),
        validationNumber: (obj.ValidationNumber || '').trim(),
      });
      model.messages.msgs = msgs;
      continue;
    }

    if (type === 'REC') {
      const isrc = (obj.ISRC || '').trim();
      const trackTitle = obj.RecordingTitle || '';
      const trackVersion = obj.VersionTitle || '';
      const releaseTitle = obj.AlbumTitle || '';
      const ean = obj.EAN || obj.Ean || obj.EanCode || obj.EanNumber || undefined;
      const catalogNumber = obj.ReleaseCatalogNumber || undefined;

      const release: {
        title?: string;
        ean?: string[];
        catno?: string;
        label?: string;
        releaseDate?: string;
      } = {
        title: releaseTitle || undefined,
        catno: catalogNumber || undefined,
        label: obj.RecordLabel || undefined,
        releaseDate: obj.ReleaseDate || undefined,
      };
      let track = isrc
        ? model.recordings.find((r) => Array.isArray(r.isrc) && r.isrc.includes(isrc))
        : null;
      if (!track) {
        track = {
          version: trackVersion || undefined,
          title: trackTitle || undefined,
          isrc: isrc ? [isrc] : undefined,
          releases: [] as any[],
        };
        model.recordings.push(track);
      } else {
        if (isrc && !track.isrc.includes(isrc)) track.isrc.push(isrc);
        if (!track.title && trackTitle) track.title = trackTitle;
        if (!track.version && trackVersion) track.version = trackVersion;
      }
      if (ean) release.ean = [ean];
      if (release.title || ean || catalogNumber || release.label || release.releaseDate) {
        track.releases = track.releases || [];
        track.releases.push(release);
      }
      continue;
    }

    if (type === 'NWR' || type === 'REV') {
      if (model.messages.type !== 'ack') {
        model.messages.type = type.toLowerCase();
      }
      const mainTitle = (obj.Title || obj.WorkTitle || '').trim();
      if (mainTitle.length) model.titles.push({ value: mainTitle, type: 'TT' });
      if (obj.ISWC) {
        pushIswc(model.identifiers, formatIswcForValidation(obj.ISWC) || obj.ISWC.trim());
      }
      if (obj.SubmitterWorkNumber) {
        const senderId = model.header.senderIdentifier;
        pushIdentifier(model.identifiers, {
          type: 'submitterWorkId',
          value: obj.SubmitterWorkNumber,
          ...(senderId
            ? {
                source: {
                  type: 'cwrSubmitter' as const,
                  value: senderId,
                  ...(model.header.senderName ? { name: model.header.senderName } : {}),
                },
              }
            : {}),
        });
      }
      if (obj.RevocationIndicator) {
        model.messages.revocation = {
          indicator: obj.RevocationIndicator,
          reason: obj.RevocationReason || undefined,
        };
      }
      if (obj.AnomalousWorkIndicator) {
        model.flags.anomalous = obj.AnomalousWorkIndicator === 'Y';
        if (obj.AnomalousWorkReason) {
          model.flags.anomalousReason = obj.AnomalousWorkReason;
        }
      }
      if (obj.AIIndicator) model.flags.aiUsage = obj.AIIndicator;
      continue;
    }

    if (type === 'ALT') {
      if (obj.AltTitle?.trim()) {
        model.titles.push({ value: obj.AltTitle.trim(), type: 'ALT' });
      }
      continue;
    }

    if (type === 'NAT') {
      const natTitle = (obj.Title || obj.AltTitle || obj.WorkTitle || '').trim();
      const natLang = (obj.LanguageCode || '').trim();
      if (natTitle.length) {
        model.titles.push({
          value: natTitle,
          type: 'NAT',
          language: langOrUndefined(natLang),
        });
      }
      continue;
    }

    if (type === 'NWN' || type === 'NOW') {
      const ip = (obj.InterestedPartyNumber || '').trim();
      const lastName = (obj.WriterLastName || '').trim();
      const firstName = (obj.WriterFirstName || '').trim();
      const lang = (obj.LanguageCode || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || lastName;
      if (ip && fullName) {
        model.writerLocalNames[ip] = { name: fullName, language: langOrUndefined(lang) };
      }
      continue;
    }

    if (type === 'NPN') {
      const ip = (obj.InterestedPartyNumber || '').trim();
      const pubName = (obj.PublisherName || '').trim();
      const lang = (obj.LanguageCode || '').trim();
      if (ip && pubName) {
        model.publisherLocalNames[ip] = { name: pubName, language: langOrUndefined(lang) };
      }
      continue;
    }

    if (type === 'SPU' || type === 'OPU') {
      if (type === 'OPU') {
        currentPublisherChain = null;
      }
      handleSpuOpu(type, obj);
      continue;
    }

    if (type === 'SPT' || type === 'OPT') {
      applyPublisherTerritory(type === 'SPT' ? 'submitter' : 'other', obj, type);
      continue;
    }

    if (type === 'SWR' || type === 'OWR') {
      startWriterGroup(type, obj);
      continue;
    }

    if (type === 'SWT' || type === 'OWT') {
      handleWriterTerritory(obj);
      continue;
    }

    if (type === 'PWR') {
      handlePwr(obj);
      continue;
    }

    if (type === 'ARI') {
      model.ariRecords.push({
        societyCode: obj.SocietyNumber || '',
        workNumber: obj.WorkNumber || undefined,
        typeOfRight: obj.TypeOfRight || '',
        subjectCode: obj.SubjectCode || undefined,
        note: obj.Note?.trim() || undefined,
      });
      continue;
    }

    if (type === 'XRF') {
      const mapped = mapXrfToIdentifier(obj);
      if (!mapped) continue;
      if (mapped.kind === 'iswc') pushIswc(model.identifiers, mapped.value);
      else if (mapped.kind === 'isrc') {
        const onRecording = model.recordings.some(
          (r) => Array.isArray(r.isrc) && r.isrc.includes(mapped.value)
        );
        if (!onRecording) model.recordings.push({ isrc: [mapped.value] });
      } else if (mapped.kind === 'ean') {
        const onRelease = model.recordings.some((r) =>
          (r.releases || []).some(
            (rel: { ean?: string[] }) => Array.isArray(rel.ean) && rel.ean.includes(mapped.value)
          )
        );
        if (!onRelease) model.recordings.push({ releases: [{ ean: [mapped.value] }] });
      } else pushIdentifier(model.identifiers, mapped.identifier);
      continue;
    }
  }

  dedupeTitles(model);
  return model;
}

function langOrUndefined(lang: string) {
  return lang || undefined;
}

function dedupeTitles(model: WorkModel) {
  if (!model.titles.length) return;
  const seen = new Set<string>();
  model.titles = model.titles.filter((wt) => {
    const key = `${wt.value}|${wt.type || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Exposed for tests: combined registries from both publisher blocks. */
export function createCombinedPublisherRegistry(model: WorkModel): PublisherRegistry {
  const combined = new PublisherRegistry();
  for (const chain of model.submitterPublisherChains) {
    combined.addChain(chain);
  }
  for (const chain of model.otherPublisherChains) {
    combined.addChain(chain);
  }
  return combined;
}
