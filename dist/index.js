var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/cwr-sdk/mapper/territoryUtils.ts
function findOrCreateTerritoryEntry(participant, include, exclude) {
  participant.territories = participant.territories || [];
  const key = `I:${include.sort().join(",")}_E:${exclude.sort().join(",")}`;
  let entry = participant.territories.find((t) => {
    const tKey = `I:${(t.territory.include || []).sort().join(",")}_E:${(t.territory.exclude || []).sort().join(",")}`;
    return tKey === key;
  });
  if (!entry) {
    entry = {
      territory: {
        include: include.length ? include : [],
        exclude: exclude.length ? exclude : []
      },
      shareTypes: [],
      agreementNumber: participant._agreementNumber
    };
    participant.territories.push(entry);
  }
  return entry;
}
__name(findOrCreateTerritoryEntry, "findOrCreateTerritoryEntry");
function addShareType(territoryEntry, type, shares) {
  if (!shares || shares.length === 0) return;
  let shareTypeEntry = territoryEntry.shareTypes.find((st) => st.type === type);
  if (!shareTypeEntry) {
    shareTypeEntry = { type, shares: [] };
    territoryEntry.shareTypes.push(shareTypeEntry);
  }
  shareTypeEntry.shares = shares;
}
__name(addShareType, "addShareType");
function normalizeSharesKey(shares = []) {
  return shares.map((s) => `${s.rightsType || ""}:${s.value ?? ""}:${s.society || ""}`).sort().join("|");
}
__name(normalizeSharesKey, "normalizeSharesKey");
function upsertOwnTerritory(participant, ownShares, agreementNumber) {
  if (!ownShares?.length) return null;
  const ownTerritory = findOrCreateTerritoryEntry(participant, [], []);
  addShareType(ownTerritory, "own", ownShares);
  if (agreementNumber) ownTerritory.agreementNumber = agreementNumber;
  return ownTerritory;
}
__name(upsertOwnTerritory, "upsertOwnTerritory");
function upsertCollectionTerritory(participant, options) {
  const { incl, tis, collShares, agreementNumber } = options;
  const collSharesKey = normalizeSharesKey(collShares || []);
  const hasAnyCollShares = (collShares || []).length > 0;
  let territoryEntry = (participant.territories || []).find((t) => {
    const existingColl = (t.shareTypes || []).find((st) => st.type === "coll")?.shares || [];
    if (!existingColl.length && !hasAnyCollShares) return false;
    return normalizeSharesKey(existingColl) === collSharesKey;
  });
  if (!territoryEntry) {
    territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
  } else if (incl) {
    territoryEntry.territory.include = Array.from(
      /* @__PURE__ */ new Set([...territoryEntry.territory.include || [], ...tis])
    );
  } else {
    territoryEntry.territory.exclude = Array.from(
      /* @__PURE__ */ new Set([...territoryEntry.territory.exclude || [], ...tis])
    );
  }
  if (hasAnyCollShares) {
    addShareType(territoryEntry, "coll", collShares);
  }
  if (agreementNumber) {
    territoryEntry.agreementNumber = agreementNumber;
  }
  return territoryEntry;
}
__name(upsertCollectionTerritory, "upsertCollectionTerritory");

// src/cwr-sdk/parser/prefix.ts
function getRecordType(line) {
  return line.substring(0, 3);
}
__name(getRecordType, "getRecordType");

// src/cwr-sdk/types/recordDefinitions.ts
var recordDefinitions = {
  HDR: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "SenderIdentifier", start: 4, length: 11, type: "A", mandatory: true, rev3: true },
    // merged field per 2.2r3 (no separate PB field)
    { label: "SenderName", start: 15, length: 45, type: "A", mandatory: true },
    { label: "EDIStandardVersionNumber", start: 60, length: 5, type: "A", mandatory: true },
    // expects "01.10"
    { label: "CreationDate", start: 65, length: 8, type: "N", mandatory: true },
    { label: "CreationTime", start: 73, length: 6, type: "N", mandatory: true },
    { label: "TransmissionDate", start: 79, length: 8, type: "N", mandatory: true },
    { label: "CharacterSet", start: 87, length: 15, type: "A", mandatory: false },
    // v2.1+
    { label: "Version", start: 102, length: 3, type: "A", mandatory: false },
    // v2.2
    { label: "Revision", start: 105, length: 3, type: "N", mandatory: false },
    { label: "SoftwarePackage", start: 108, length: 30, type: "A", mandatory: false },
    { label: "SoftwarePackageVersion", start: 138, length: 30, type: "A", mandatory: false }
  ],
  GRH: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionType", start: 4, length: 3, type: "L", mandatory: true },
    { label: "GroupId", start: 7, length: 5, type: "N", mandatory: true },
    { label: "TransactionVersionNumber", start: 12, length: 5, type: "A", mandatory: true },
    // e.g. 02.210 (spec)
    { label: "BatchRequest", start: 17, length: 10, type: "N", mandatory: false },
    { label: "SubmissionDistributionType", start: 27, length: 2, type: "L", mandatory: false }
    // blank for CWR
  ],
  NWR: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "WorkTitle", start: 20, length: 60, type: "A", mandatory: true },
    { label: "LanguageCode", start: 80, length: 2, type: "A", mandatory: false },
    { label: "SubmitterWorkNumber", start: 82, length: 14, type: "A", mandatory: true },
    { label: "ISWC", start: 96, length: 11, type: "A", mandatory: false },
    { label: "CopyrightDate", start: 107, length: 8, type: "N", mandatory: false },
    { label: "CopyrightNumber", start: 115, length: 12, type: "A", mandatory: false },
    { label: "MusicalWorkDistributionCat", start: 127, length: 3, type: "A", mandatory: true },
    { label: "Duration", start: 130, length: 6, type: "A", mandatory: false },
    { label: "RecordedIndicator", start: 136, length: 1, type: "A", mandatory: true },
    { label: "TextMusicRelationship", start: 137, length: 3, type: "A", mandatory: false },
    { label: "CompositeType", start: 140, length: 3, type: "A", mandatory: false },
    { label: "VersionType", start: 143, length: 3, type: "A", mandatory: true },
    { label: "ExcerptType", start: 146, length: 3, type: "A", mandatory: false },
    { label: "MusicArrangement", start: 149, length: 3, type: "A", mandatory: false },
    { label: "LyricAdaptation", start: 152, length: 3, type: "A", mandatory: false },
    { label: "ContactName", start: 155, length: 30, type: "A", mandatory: false },
    { label: "ContactId", start: 185, length: 10, type: "A", mandatory: false },
    { label: "CWRWorkType", start: 195, length: 2, type: "A", mandatory: false },
    { label: "GrandRightsIndicator", start: 197, length: 1, type: "A", mandatory: false },
    { label: "CompositeComponentCount", start: 198, length: 3, type: "N", mandatory: false },
    { label: "DateOfPublicationPrintedEd", start: 201, length: 8, type: "N", mandatory: false },
    { label: "ExceptionalClause", start: 209, length: 1, type: "A", mandatory: false },
    { label: "OpusNumber", start: 210, length: 25, type: "A", mandatory: false },
    { label: "CatalogueNumber", start: 235, length: 25, type: "A", mandatory: false },
    { label: "PriorityFlag", start: 260, length: 1, type: "A", mandatory: false },
    { label: "RevocationIndicator", start: 261, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RevocationReason", start: 262, length: 3, type: "A", mandatory: false, rev3: true },
    { label: "AnomalousWorkIndicator", start: 265, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "AnomalousWorkReason", start: 266, length: 3, type: "A", mandatory: false, rev3: true },
    { label: "AIIndicator", start: 269, length: 1, type: "A", mandatory: false, rev3: true }
  ],
  REV: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "WorkTitle", start: 20, length: 60, type: "A", mandatory: true },
    { label: "LanguageCode", start: 80, length: 2, type: "A", mandatory: false },
    { label: "SubmitterWorkNumber", start: 82, length: 14, type: "A", mandatory: true },
    { label: "ISWC", start: 96, length: 11, type: "A", mandatory: false },
    { label: "CopyrightDate", start: 107, length: 8, type: "N", mandatory: false },
    { label: "CopyrightNumber", start: 115, length: 12, type: "A", mandatory: false },
    { label: "MusicalWorkDistributionCat", start: 127, length: 3, type: "A", mandatory: true },
    { label: "Duration", start: 130, length: 6, type: "A", mandatory: false },
    { label: "RecordedIndicator", start: 136, length: 1, type: "A", mandatory: true },
    { label: "TextMusicRelationship", start: 137, length: 3, type: "A", mandatory: false },
    { label: "CompositeType", start: 140, length: 3, type: "A", mandatory: false },
    { label: "VersionType", start: 143, length: 3, type: "A", mandatory: true },
    { label: "ExcerptType", start: 146, length: 3, type: "A", mandatory: false },
    { label: "MusicArrangement", start: 149, length: 3, type: "A", mandatory: false },
    { label: "LyricAdaptation", start: 152, length: 3, type: "A", mandatory: false },
    { label: "ContactName", start: 155, length: 30, type: "A", mandatory: false },
    { label: "ContactId", start: 185, length: 10, type: "A", mandatory: false },
    { label: "CWRWorkType", start: 195, length: 2, type: "A", mandatory: false },
    { label: "GrandRightsIndicator", start: 197, length: 1, type: "A", mandatory: false },
    { label: "CompositeComponentCount", start: 198, length: 3, type: "N", mandatory: false },
    { label: "DateOfPublicationPrintedEd", start: 201, length: 8, type: "N", mandatory: false },
    { label: "ExceptionalClause", start: 209, length: 1, type: "A", mandatory: false },
    { label: "OpusNumber", start: 210, length: 25, type: "A", mandatory: false },
    { label: "CatalogueNumber", start: 235, length: 25, type: "A", mandatory: false },
    { label: "PriorityFlag", start: 260, length: 1, type: "A", mandatory: false },
    { label: "RevocationIndicator", start: 261, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RevocationReason", start: 262, length: 3, type: "A", mandatory: false, rev3: true },
    { label: "AnomalousWorkIndicator", start: 265, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "AnomalousWorkReason", start: 266, length: 3, type: "A", mandatory: false, rev3: true },
    { label: "AIIndicator", start: 269, length: 1, type: "A", mandatory: false, rev3: true }
  ],
  SPU: [
    // Record prefix
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    // Core publisher fields
    { label: "PublisherSequence", start: 20, length: 2, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 22, length: 9, type: "A", mandatory: true },
    // SPU required
    { label: "PublisherName", start: 31, length: 45, type: "A", mandatory: true },
    { label: "PublisherUnknownIndicator", start: 76, length: 1, type: "A", mandatory: false },
    // must be blank for SPU
    { label: "PublisherType", start: 77, length: 2, type: "A", mandatory: true },
    { label: "TaxId", start: 79, length: 9, type: "A", mandatory: false },
    { label: "IPInameNumber", start: 88, length: 11, type: "A", mandatory: false },
    { label: "SubmitterAgreementNumber", start: 99, length: 14, type: "A", mandatory: false },
    { label: "PRAffiliationSociety", start: 113, length: 3, type: "A", mandatory: false },
    { label: "PROwnershipShare", start: 116, length: 5, type: "N", mandatory: false },
    { label: "MRAffiliationSociety", start: 121, length: 3, type: "A", mandatory: false },
    { label: "MROwnershipShare", start: 124, length: 5, type: "N", mandatory: false },
    { label: "SRAffiliationSociety", start: 129, length: 3, type: "A", mandatory: false },
    { label: "SROwnershipShare", start: 132, length: 5, type: "N", mandatory: false },
    { label: "SpecialAgreementsIndicator", start: 137, length: 1, type: "A", mandatory: false },
    { label: "FirstRecordingRefusalInd", start: 138, length: 1, type: "A", mandatory: false },
    { label: "Filler2", start: 139, length: 1, type: "A", mandatory: false },
    // Version 2.0 fields
    { label: "IPIBaseNumber", start: 140, length: 13, type: "A", mandatory: false },
    { label: "InternationalStandardAgreementCode", start: 153, length: 14, type: "A", mandatory: false },
    { label: "SocietyAssignedAgreementNumber", start: 167, length: 14, type: "A", mandatory: false },
    // Version 2.1 fields
    { label: "AgreementType", start: 181, length: 2, type: "A", mandatory: false },
    { label: "USALicenseIndicator", start: 183, length: 1, type: "A", mandatory: false }
  ],
  SPT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "ConstantSpaces", start: 29, length: 6, type: "A", mandatory: true },
    { label: "PRCollectionShare", start: 35, length: 5, type: "N", mandatory: false },
    { label: "MRCollectionShare", start: 40, length: 5, type: "N", mandatory: false },
    { label: "SRCollectionShare", start: 45, length: 5, type: "N", mandatory: false },
    { label: "InclusionExclusionIndicator", start: 50, length: 1, type: "A", mandatory: true },
    { label: "TISNumericCode", start: 51, length: 4, type: "A", mandatory: true },
    { label: "SharesChange", start: 55, length: 1, type: "A", mandatory: false },
    { label: "SequenceNumber", start: 56, length: 3, type: "N", mandatory: true }
  ],
  OPU: [
    // Record prefix
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    // Core publisher fields (more optional for OPU)
    { label: "PublisherSequence", start: 20, length: 2, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 22, length: 9, type: "A", mandatory: false },
    { label: "PublisherName", start: 31, length: 45, type: "A", mandatory: false },
    { label: "PublisherUnknownIndicator", start: 76, length: 1, type: "A", mandatory: false },
    { label: "PublisherType", start: 77, length: 2, type: "A", mandatory: false },
    { label: "TaxId", start: 79, length: 9, type: "A", mandatory: false },
    { label: "IPInameNumber", start: 88, length: 11, type: "A", mandatory: false },
    { label: "SubmitterAgreementNumber", start: 99, length: 14, type: "A", mandatory: false },
    { label: "PRAffiliationSociety", start: 113, length: 3, type: "A", mandatory: false },
    { label: "PROwnershipShare", start: 116, length: 5, type: "N", mandatory: false },
    { label: "MRAffiliationSociety", start: 121, length: 3, type: "A", mandatory: false },
    { label: "MROwnershipShare", start: 124, length: 5, type: "N", mandatory: false },
    { label: "SRAffiliationSociety", start: 129, length: 3, type: "A", mandatory: false },
    { label: "SROwnershipShare", start: 132, length: 5, type: "N", mandatory: false },
    { label: "SpecialAgreementsIndicator", start: 137, length: 1, type: "A", mandatory: false },
    { label: "FirstRecordingRefusalInd", start: 138, length: 1, type: "A", mandatory: false },
    { label: "Filler2", start: 139, length: 1, type: "A", mandatory: false },
    // Version 2.0 fields
    { label: "IPIBaseNumber", start: 140, length: 13, type: "A", mandatory: false },
    { label: "InternationalStandardAgreementCode", start: 153, length: 14, type: "A", mandatory: false },
    { label: "SocietyAssignedAgreementNumber", start: 167, length: 14, type: "A", mandatory: false },
    // Version 2.1 fields
    { label: "AgreementType", start: 181, length: 2, type: "A", mandatory: false },
    { label: "USALicenseIndicator", start: 183, length: 1, type: "A", mandatory: false }
  ],
  OPT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "ConstantSpaces", start: 29, length: 6, type: "A", mandatory: true },
    { label: "PRCollectionShare", start: 35, length: 5, type: "N", mandatory: false },
    { label: "MRCollectionShare", start: 40, length: 5, type: "N", mandatory: false },
    { label: "SRCollectionShare", start: 45, length: 5, type: "N", mandatory: false },
    { label: "InclusionExclusionIndicator", start: 50, length: 1, type: "A", mandatory: true },
    { label: "TISNumericCode", start: 51, length: 4, type: "A", mandatory: true },
    { label: "SharesChange", start: 55, length: 1, type: "A", mandatory: false },
    { label: "SequenceNumber", start: 56, length: 3, type: "N", mandatory: true }
  ],
  SWR: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "WriterLastName", start: 29, length: 45, type: "A", mandatory: true },
    { label: "WriterFirstName", start: 74, length: 30, type: "A", mandatory: false },
    { label: "WriterUnknownIndicator", start: 104, length: 1, type: "A", mandatory: false },
    { label: "WriterDesignationCode", start: 105, length: 2, type: "A", mandatory: true },
    { label: "TaxId", start: 107, length: 9, type: "A", mandatory: false },
    { label: "IPINameNumber", start: 116, length: 11, type: "A", mandatory: false },
    { label: "PRAffiliationSociety", start: 127, length: 3, type: "A", mandatory: false },
    { label: "PROwnershipShare", start: 130, length: 5, type: "N", mandatory: false },
    { label: "MRAffiliationSociety", start: 135, length: 3, type: "A", mandatory: false },
    { label: "MROwnershipShare", start: 138, length: 5, type: "N", mandatory: false },
    { label: "SRAffiliationSociety", start: 143, length: 3, type: "A", mandatory: false },
    { label: "SROwnershipShare", start: 146, length: 5, type: "N", mandatory: false },
    { label: "ReversionaryIndicator", start: 151, length: 1, type: "A", mandatory: false },
    { label: "FirstRecordingRefusalInd", start: 152, length: 1, type: "A", mandatory: false },
    { label: "WorkForHireIndicator", start: 153, length: 1, type: "A", mandatory: false },
    { label: "Filler2", start: 154, length: 1, type: "A", mandatory: false },
    { label: "IPIBaseNumber", start: 155, length: 13, type: "A", mandatory: false },
    { label: "PersonalNumber", start: 168, length: 12, type: "A", mandatory: false },
    { label: "USALicenseIndicator", start: 180, length: 1, type: "A", mandatory: false }
  ],
  OWR: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "WriterLastName", start: 29, length: 45, type: "A", mandatory: true },
    { label: "WriterFirstName", start: 74, length: 30, type: "A", mandatory: false },
    { label: "WriterUnknownIndicator", start: 104, length: 1, type: "A", mandatory: false },
    { label: "WriterDesignationCode", start: 105, length: 2, type: "A", mandatory: true },
    { label: "TaxId", start: 107, length: 9, type: "A", mandatory: false },
    { label: "IPINameNumber", start: 116, length: 11, type: "A", mandatory: false },
    { label: "PRAffiliationSociety", start: 127, length: 3, type: "A", mandatory: false },
    { label: "PROwnershipShare", start: 130, length: 5, type: "N", mandatory: false },
    { label: "MRAffiliationSociety", start: 135, length: 3, type: "A", mandatory: false },
    { label: "MROwnershipShare", start: 138, length: 5, type: "N", mandatory: false },
    { label: "SRAffiliationSociety", start: 143, length: 3, type: "A", mandatory: false },
    { label: "SROwnershipShare", start: 146, length: 5, type: "N", mandatory: false },
    { label: "ReversionaryIndicator", start: 151, length: 1, type: "A", mandatory: false },
    { label: "FirstRecordingRefusalInd", start: 152, length: 1, type: "A", mandatory: false },
    { label: "WorkForHireIndicator", start: 153, length: 1, type: "A", mandatory: false },
    { label: "Filler2", start: 154, length: 1, type: "A", mandatory: false },
    { label: "IPIBaseNumber", start: 155, length: 13, type: "A", mandatory: false },
    { label: "PersonalNumber", start: 168, length: 12, type: "A", mandatory: false },
    { label: "USALicenseIndicator", start: 180, length: 1, type: "A", mandatory: false }
  ],
  SWT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "PRCollectionShare", start: 29, length: 5, type: "N", mandatory: false },
    { label: "MRCollectionShare", start: 34, length: 5, type: "N", mandatory: false },
    { label: "SRCollectionShare", start: 39, length: 5, type: "N", mandatory: false },
    { label: "InclusionExclusionIndicator", start: 44, length: 1, type: "A", mandatory: true },
    { label: "TISNumericCode", start: 45, length: 4, type: "A", mandatory: true },
    { label: "SharesChange", start: 49, length: 1, type: "A", mandatory: false },
    { label: "SequenceNumber", start: 50, length: 3, type: "N", mandatory: true }
  ],
  OWT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: false },
    // optional for OWT
    { label: "PRCollectionShare", start: 29, length: 5, type: "N", mandatory: false },
    { label: "MRCollectionShare", start: 34, length: 5, type: "N", mandatory: false },
    { label: "SRCollectionShare", start: 39, length: 5, type: "N", mandatory: false },
    { label: "InclusionExclusionIndicator", start: 44, length: 1, type: "A", mandatory: true },
    { label: "TISNumericCode", start: 45, length: 4, type: "A", mandatory: true },
    { label: "SharesChange", start: 49, length: 1, type: "A", mandatory: false },
    { label: "SequenceNumber", start: 50, length: 3, type: "N", mandatory: true }
  ],
  PWR: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "PublisherIPNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "PublisherName", start: 29, length: 45, type: "A", mandatory: true },
    { label: "SubmitterAgreementNumber", start: 74, length: 14, type: "A", mandatory: false },
    { label: "SocietyAssignedAgreementNumber", start: 88, length: 14, type: "A", mandatory: false },
    { label: "WriterIPNumber", start: 102, length: 9, type: "A", mandatory: true },
    { label: "PublisherSequenceNumber", start: 111, length: 2, type: "N", mandatory: true },
    // Relinquishment fields (CWR 2.2-Rev3) - at end of PWR
    { label: "RelinquishmentIndicator", start: 113, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RelinquishmentEffectiveDate", start: 114, length: 8, type: "N", mandatory: false, rev3: true },
    { label: "PostTermCollectionDate", start: 122, length: 8, type: "N", mandatory: false, rev3: true },
    { label: "RelinquishmentPR", start: 130, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RelinquishmentMR", start: 131, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RelinquishmentSR", start: 132, length: 1, type: "A", mandatory: false, rev3: true },
    { label: "RelinquishmentTerritoryCode", start: 133, length: 4, type: "N", mandatory: false, rev3: true },
    { label: "RelinquishmentTerritoryIndicator", start: 137, length: 1, type: "A", mandatory: false, rev3: true }
  ],
  ALT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "AlternateTitle", start: 20, length: 60, type: "A", mandatory: true },
    { label: "TitleType", start: 80, length: 2, type: "A", mandatory: true },
    { label: "LanguageCode", start: 82, length: 2, type: "A", mandatory: false }
  ],
  PER: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "PerformingArtistLastName", start: 20, length: 45, type: "A", mandatory: true },
    { label: "PerformingArtistFirstName", start: 65, length: 30, type: "A", mandatory: false },
    { label: "PerformingArtistIPIName", start: 95, length: 11, type: "A", mandatory: false },
    { label: "PerformingArtistIPIBase", start: 106, length: 13, type: "A", mandatory: false }
  ],
  REC: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "ReleaseDate", start: 20, length: 8, type: "N", mandatory: false },
    { label: "ConstantSpaces1", start: 28, length: 60, type: "A", mandatory: false },
    { label: "ReleaseDuration", start: 88, length: 6, type: "A", mandatory: false },
    { label: "ConstantSpaces2", start: 94, length: 5, type: "A", mandatory: false },
    // Version 2.0
    { label: "AlbumTitle", start: 99, length: 60, type: "A", mandatory: false },
    { label: "AlbumLabel", start: 159, length: 60, type: "A", mandatory: false },
    { label: "ReleaseCatalogNumber", start: 219, length: 18, type: "A", mandatory: false },
    { label: "EAN", start: 237, length: 13, type: "A", mandatory: false },
    { label: "ISRC", start: 250, length: 12, type: "A", mandatory: false },
    { label: "RecordingFormat", start: 262, length: 1, type: "A", mandatory: false },
    { label: "RecordingTechnique", start: 263, length: 1, type: "A", mandatory: false },
    // Version 2.1
    { label: "MediaType", start: 264, length: 3, type: "A", mandatory: false },
    // Version 2.2
    { label: "RecordingTitle", start: 267, length: 60, type: "A", mandatory: false },
    { label: "VersionTitle", start: 327, length: 60, type: "A", mandatory: false },
    { label: "DisplayArtist", start: 387, length: 60, type: "A", mandatory: false },
    { label: "RecordLabel", start: 447, length: 60, type: "A", mandatory: false },
    { label: "ISRCValidity", start: 507, length: 20, type: "A", mandatory: false },
    { label: "SubmitterRecordingIdentifier", start: 527, length: 14, type: "A", mandatory: false }
  ],
  ARI: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "SocietyNumber", start: 20, length: 3, type: "A", mandatory: true },
    { label: "WorkNumber", start: 23, length: 14, type: "A", mandatory: false },
    { label: "TypeOfRight", start: 37, length: 3, type: "A", mandatory: true },
    { label: "SubjectCode", start: 40, length: 2, type: "A", mandatory: false },
    { label: "Note", start: 42, length: 160, type: "A", mandatory: false }
  ],
  XRF: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "OrganisationCode", start: 20, length: 3, type: "A", mandatory: true },
    { label: "Identifier", start: 23, length: 14, type: "A", mandatory: true },
    { label: "IdentifierType", start: 37, length: 1, type: "A", mandatory: true },
    { label: "Validity", start: 38, length: 1, type: "A", mandatory: true }
  ],
  // Non-Roman Alphabet Records (for UTF-8 / international names)
  NAT: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "Title", start: 20, length: 60, type: "A", mandatory: true },
    { label: "TitleType", start: 80, length: 2, type: "A", mandatory: true },
    { label: "LanguageCode", start: 82, length: 2, type: "A", mandatory: false }
  ],
  NWN: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "WriterLastName", start: 29, length: 45, type: "A", mandatory: true },
    { label: "WriterFirstName", start: 74, length: 30, type: "A", mandatory: false },
    { label: "LanguageCode", start: 104, length: 2, type: "A", mandatory: false }
  ],
  NOW: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "WriterLastName", start: 29, length: 45, type: "A", mandatory: true },
    { label: "WriterFirstName", start: 74, length: 30, type: "A", mandatory: false },
    { label: "LanguageCode", start: 104, length: 2, type: "A", mandatory: false }
  ],
  NPN: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "InterestedPartyNumber", start: 20, length: 9, type: "A", mandatory: true },
    { label: "PublisherSequence", start: 29, length: 2, type: "N", mandatory: true },
    { label: "PublisherName", start: 31, length: 45, type: "A", mandatory: true },
    { label: "LanguageCode", start: 76, length: 2, type: "A", mandatory: false }
  ]
};

// src/cwr-sdk/parser/recordParser.ts
function parseRecordLine(line) {
  const type = getRecordType(line);
  const def = recordDefinitions[type];
  if (!def) {
    const rawBody = line.substring(3);
    return {
      type,
      fields: [
        {
          label: "RecordType",
          value: type,
          displayValue: type,
          mandatory: false
        },
        {
          label: "Raw",
          value: rawBody,
          displayValue: rawBody.trim().length === 0 ? "" : rawBody,
          mandatory: false
        }
      ]
    };
  }
  const fields = [];
  for (const f of def) {
    const startIndex = f.start - 1;
    const endIndex = startIndex + f.length;
    const raw = line.substring(startIndex, endIndex);
    const isBlank = raw.trim().length === 0;
    const displayValue = isBlank ? ".." : raw.trimEnd();
    fields.push({
      label: f.label,
      value: raw,
      // exact slice; no trimming/munging
      displayValue,
      mandatory: f.mandatory,
      type: f.type,
      start: f.start,
      length: f.length,
      rev3: "rev3" in f ? Boolean(f.rev3) : false
    });
  }
  return { type, fields };
}
__name(parseRecordLine, "parseRecordLine");

// src/cwr-sdk/mapper/workModel/parseHelpers.ts
function lineToObj(line) {
  const parsed = parseRecordLine(line);
  const fields = parsed?.fields || parsed;
  if (!Array.isArray(fields)) return {};
  return fields.reduce((acc, f) => {
    acc[f.label] = (f.value ?? "").trim();
    return acc;
  }, {});
}
__name(lineToObj, "lineToObj");
function parseShares(obj, prKey, mrKey, srKey, defaultSociety) {
  const shares = [];
  const toVal = /* @__PURE__ */ __name((v) => {
    if (!v || !v.trim()) return void 0;
    const num = parseFloat(v) / 100;
    return parseFloat(num.toFixed(2));
  }, "toVal");
  const pushShare = /* @__PURE__ */ __name((rightsType, val) => {
    if (val !== void 0 && !Number.isNaN(val)) {
      shares.push({ rightsType, value: val, society: defaultSociety });
    }
  }, "pushShare");
  pushShare("pr", toVal(obj[prKey]));
  pushShare("mr", toVal(obj[mrKey]));
  pushShare("sr", toVal(obj[srKey]));
  return shares;
}
__name(parseShares, "parseShares");
function normalizePartyKey(value) {
  return (value || "").trim().replace(/^0+/, "");
}
__name(normalizePartyKey, "normalizePartyKey");
function normalizeSequenceKey(seq) {
  const raw = (seq || "").trim();
  if (!raw) return "";
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return raw;
  return String(n).padStart(2, "0");
}
__name(normalizeSequenceKey, "normalizeSequenceKey");
function isPublisherOwnEligible(role) {
  return (role || "").trim() === "E";
}
__name(isPublisherOwnEligible, "isPublisherOwnEligible");

// src/cwr-sdk/mapper/workModel/publisherRegistry.ts
var _PublisherRegistry = class _PublisherRegistry {
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
    if (!key) return;
    if (!this.byIp[key] || role === "E") {
      this.byIp[key] = participant;
    }
    const normalized = normalizePartyKey(key);
    if (normalized && (!this.byIp[normalized] || role === "E")) {
      this.byIp[normalized] = participant;
    }
  }
  registerSeqAndIp(seq, partyId, participant) {
    this.bySeqAndIp[`${seq}|${partyId}`] = participant;
    const normalized = normalizePartyKey(partyId);
    if (normalized) this.bySeqAndIp[`${seq}|${normalized}`] = participant;
  }
  resolveByKey(key) {
    if (!key) return null;
    return this.byIp[key] || this.byIp[normalizePartyKey(key)] || null;
  }
  resolveForPwr(seq, pubIp) {
    const seqKey = normalizeSequenceKey(seq);
    const ip = (pubIp || "").trim();
    if (seqKey && ip) {
      const byComposite = this.bySeqAndIp[`${seqKey}|${ip}`] || this.bySeqAndIp[`${seqKey}|${normalizePartyKey(ip)}`];
      if (byComposite) return byComposite;
    }
    if (seqKey && this.bySequence[seqKey]) {
      return this.bySequence[seqKey];
    }
    return this.resolveByKey(pubIp);
  }
  /** Party on a chain that should receive the next SPT (sub-publisher or E). */
  activePartyOnChain(chain) {
    const subs = chain.party.representedBy;
    if (subs.length > 0) return subs[subs.length - 1];
    return chain.party;
  }
  findChainForParty(party) {
    return this.chains.find((c) => c.party === party || c.party.representedBy.includes(party));
  }
  allPublisherParties() {
    const seen = /* @__PURE__ */ new Set();
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
};
__name(_PublisherRegistry, "PublisherRegistry");
var PublisherRegistry = _PublisherRegistry;

// src/cwr-sdk/mapper/workModel/buildWorkModel.ts
function buildWorkModel(lines) {
  const model = {
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
    otherWriterGroups: []
  };
  const submitterRegistry = new PublisherRegistry();
  const otherRegistry = new PublisherRegistry();
  let currentPublisherBlock = "submitter";
  let currentPublisherChain = null;
  let currentWriterGroup = null;
  let currentWriterBlock = "controlled";
  const trackByIsrc = {};
  const chainsForBlock = /* @__PURE__ */ __name((block) => block === "submitter" ? model.submitterPublisherChains : model.otherPublisherChains, "chainsForBlock");
  const registryForBlock = /* @__PURE__ */ __name((block) => block === "submitter" ? submitterRegistry : otherRegistry, "registryForBlock");
  const writerGroupsForBlock = /* @__PURE__ */ __name((block) => block === "controlled" ? model.controlledWriterGroups : model.otherWriterGroups, "writerGroupsForBlock");
  const createPublisherParty = /* @__PURE__ */ __name((obj, recordType, sequenceOverride) => {
    const partyNumber = (obj.InterestedPartyNumber || "").trim();
    const ipiNameNumber = (obj.IPInameNumber || "").trim();
    const ip = partyNumber || ipiNameNumber;
    const role = obj.PublisherType || "E";
    const name = obj.PublisherName || "";
    const ipi = obj.IPInameNumber || obj.IPIBaseNumber || "";
    const sequence = sequenceOverride ?? normalizeSequenceKey(obj.PublisherSequence);
    const agreementNumber = obj.SubmitterAgreementNumber || obj.SocietyAssignedAgreementNumber || void 0;
    const defaultSociety = obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const controlled = recordType === "SPU" ? "yes" : "no";
    const ownShares = parseShares(
      obj,
      "PROwnershipShare",
      "MROwnershipShare",
      "SROwnershipShare",
      defaultSociety
    );
    const party = {
      role,
      name,
      ipi,
      partyId: ip,
      controlled,
      _isPublisher: true,
      _publisherSequence: sequence || void 0,
      _agreementNumber: agreementNumber ? { source: defaultSociety || void 0, value: agreementNumber } : void 0,
      _ownShares: ownShares,
      territories: [],
      representedBy: []
    };
    if (isPublisherOwnEligible(role)) {
      upsertOwnTerritory(
        party,
        ownShares,
        agreementNumber ? { source: defaultSociety || void 0, value: agreementNumber } : void 0
      );
    }
    return party;
  }, "createPublisherParty");
  const handleSpuOpu = /* @__PURE__ */ __name((type, obj) => {
    const block = type === "SPU" ? "submitter" : "other";
    currentPublisherBlock = block;
    const role = obj.PublisherType || "E";
    const sequence = normalizeSequenceKey(obj.PublisherSequence);
    const recordSeq = obj.RecordSeq || "";
    const controlled = type === "SPU" ? "yes" : "no";
    const registry = registryForBlock(block);
    const chains = chainsForBlock(block);
    if (role === "E") {
      const party2 = createPublisherParty(obj, type, sequence);
      const chain2 = { sequence, recordSeq, controlled, party: party2 };
      chains.push(chain2);
      registry.addChain(chain2);
      currentPublisherChain = chain2;
      return;
    }
    if (["SE", "AM", "PA"].includes(role) && currentPublisherChain) {
      const sub = createPublisherParty(obj, type, currentPublisherChain.sequence);
      currentPublisherChain.party.representedBy.push(sub);
      registry.addChain(currentPublisherChain);
      return;
    }
    const party = createPublisherParty(obj, type, sequence);
    const chain = { sequence, recordSeq, controlled, party };
    chains.push(chain);
    registry.addChain(chain);
    currentPublisherChain = chain;
  }, "handleSpuOpu");
  const applyPublisherTerritory = /* @__PURE__ */ __name((block, obj, recordType) => {
    const ip = obj.InterestedPartyNumber || "";
    const incl = obj.InclusionExclusionIndicator === "I";
    const tis = obj.TISNumericCode ? [obj.TISNumericCode] : [];
    const agreement = (obj.SubmitterAgreementNumber || obj.SocietyAssignedAgreementNumber || "").trim();
    const defaultSociety = obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const collShares = parseShares(obj, "PRCollectionShare", "MRCollectionShare", "SRCollectionShare");
    const registry = registryForBlock(block);
    let target = registry.resolveByKey(ip) || (currentPublisherChain ? registry.activePartyOnChain(currentPublisherChain) : null);
    if (!target) return;
    upsertCollectionTerritory(target, {
      incl,
      tis,
      collShares,
      agreementNumber: agreement ? { source: defaultSociety || void 0, value: agreement } : void 0
    });
  }, "applyPublisherTerritory");
  const startWriterGroup = /* @__PURE__ */ __name((type, obj) => {
    const block = type === "SWR" ? "controlled" : "other";
    currentWriterBlock = block;
    const ip = obj.InterestedPartyNumber || "";
    const role = obj.WriterDesignationCode || "C";
    const name = [obj.WriterFirstName, obj.WriterLastName].filter(Boolean).join(" ").trim() || obj.WriterLastName || "";
    const ipi = obj.IPINameNumber || obj.IPIBaseNumber || obj.IPInameNumber || "";
    const defaultSociety = obj.PRAffiliationSociety || obj.MRAffiliationSociety || obj.SRAffiliationSociety;
    const controlled = type === "SWR" ? "yes" : "no";
    const ownShares = parseShares(
      obj,
      "PROwnershipShare",
      "MROwnershipShare",
      "SROwnershipShare",
      defaultSociety
    );
    const writer = {
      role,
      name,
      ipi,
      partyId: ip,
      controlled,
      _isPublisher: false,
      _ownShares: ownShares,
      territories: [],
      representedBy: []
    };
    upsertOwnTerritory(writer, ownShares);
    const group = {
      writer,
      collectionTerritories: [],
      pwrLinks: []
    };
    writerGroupsForBlock(block).push(group);
    currentWriterGroup = group;
  }, "startWriterGroup");
  const handleWriterTerritory = /* @__PURE__ */ __name((obj) => {
    if (!currentWriterGroup) return;
    const incl = obj.InclusionExclusionIndicator === "I";
    const tis = obj.TISNumericCode ? [obj.TISNumericCode] : [];
    const collShares = parseShares(obj, "PRCollectionShare", "MRCollectionShare", "SRCollectionShare");
    const input = { incl, tis, collShares };
    currentWriterGroup.collectionTerritories.push(input);
  }, "handleWriterTerritory");
  const handlePwr = /* @__PURE__ */ __name((obj) => {
    if (!currentWriterGroup) return;
    const writerIp = obj.WriterIPNumber || "";
    const pubIp = obj.PublisherIPNumber || "";
    const publisherSequence = normalizeSequenceKey(obj.PublisherSequenceNumber);
    const link = { writerIp, pubIp, publisherSequence };
    if (obj.RelinquishmentIndicator === "Y" && pubIp) {
      const registry = currentWriterBlock === "controlled" ? submitterRegistry : otherRegistry;
      const pub = registry.resolveForPwr(publisherSequence, pubIp);
      if (pub) {
        const rightsTypes = [];
        if (obj.RelinquishmentPR === "Y") rightsTypes.push("pr");
        if (obj.RelinquishmentMR === "Y") rightsTypes.push("mr");
        if (obj.RelinquishmentSR === "Y") rightsTypes.push("sr");
        pub.relinquishment = {
          effectiveFrom: obj.RelinquishmentEffectiveDate || "",
          postTermCollectionUntil: obj.PostTermCollectionDate || void 0,
          scope: {
            rightsTypes,
            territories: {
              include: obj.RelinquishmentTerritoryIndicator === "I" ? [obj.RelinquishmentTerritoryCode] : [],
              exclude: obj.RelinquishmentTerritoryIndicator === "E" ? [obj.RelinquishmentTerritoryCode] : []
            }
          },
          note: "E publisher stops representing this writer for the specified scope."
        };
      }
    }
    currentWriterGroup.pwrLinks.push(link);
  }, "handlePwr");
  for (const line of lines) {
    const type = line.substring(0, 3);
    const obj = lineToObj(line);
    if (type === "HDR") {
      model.header = {
        senderIdentifier: obj.SenderIdentifier || void 0,
        senderName: obj.SenderName || void 0,
        creationDate: obj.CreationDate || void 0,
        creationTime: obj.CreationTime || void 0,
        version: obj.Version || void 0,
        softwarePackage: obj.SoftwarePackage || void 0
      };
      continue;
    }
    if (type === "MSG") {
      const rawMessage = (obj.Raw || line.substring(3)).trim();
      const [statusToken, ...rest] = rawMessage.split(/\s+/);
      const status = statusToken || "status";
      const text = rest.join(" ") || rawMessage;
      const msgs = model.messages.msgs || [];
      msgs.push({ status, message: text.trim() });
      model.messages.msgs = msgs;
      continue;
    }
    if (type === "REC") {
      const isrc = obj.ISRC || "";
      const trackTitle = obj.RecordingTitle || "";
      const trackVersion = obj.VersionTitle || "";
      const releaseTitle = obj.AlbumTitle || "";
      const ean = obj.EAN || obj.Ean || obj.EanCode || obj.EanNumber || void 0;
      const catalogNumber = obj.ReleaseCatalogNumber || void 0;
      const releaseIdentifiers = [];
      if (ean) releaseIdentifiers.push({ source: "ean", value: ean });
      if (catalogNumber) releaseIdentifiers.push({ source: "catalogNumber", value: catalogNumber });
      const release = {
        title: releaseTitle || void 0,
        identifiers: releaseIdentifiers.length ? releaseIdentifiers : void 0,
        label: obj.RecordLabel || void 0,
        releaseDate: obj.ReleaseDate || void 0
      };
      let track = isrc ? trackByIsrc[isrc] : null;
      if (!track) {
        track = {
          version: trackVersion || void 0,
          title: trackTitle || void 0,
          isrc: isrc || void 0,
          releases: []
        };
        if (isrc) trackByIsrc[isrc] = track;
        model.recordings.push(track);
      }
      if (release.title || ean || catalogNumber || release.label || release.releaseDate) {
        track.releases = track.releases || [];
        track.releases.push(release);
      }
      continue;
    }
    if (type === "NWR" || type === "REV") {
      model.messages.type = type.toLowerCase();
      const mainTitle = (obj.Title || obj.WorkTitle || "").trim();
      if (mainTitle.length) model.titles.push({ value: mainTitle, type: "TT" });
      if (obj.ISWC) model.identifiers.push({ source: "iswc", value: obj.ISWC });
      if (obj.SubmitterWorkNumber) {
        model.identifiers.push({ source: "submitterWorkNumber", value: obj.SubmitterWorkNumber });
      }
      if (obj.RevocationIndicator) {
        model.messages.revocation = {
          indicator: obj.RevocationIndicator,
          reason: obj.RevocationReason || void 0
        };
      }
      if (obj.AnomalousWorkIndicator) {
        model.flags.anomalous = obj.AnomalousWorkIndicator === "Y";
        if (obj.AnomalousWorkReason) {
          model.flags.anomalousReason = obj.AnomalousWorkReason;
        }
      }
      if (obj.AIIndicator) model.flags.aiUsage = obj.AIIndicator;
      continue;
    }
    if (type === "ALT") {
      if (obj.AltTitle?.trim()) {
        model.titles.push({ value: obj.AltTitle.trim(), type: "ALT" });
      }
      continue;
    }
    if (type === "NAT") {
      const natTitle = (obj.Title || obj.AltTitle || obj.WorkTitle || "").trim();
      const natLang = (obj.LanguageCode || "").trim();
      if (natTitle.length) {
        model.titles.push({
          value: natTitle,
          type: "NAT",
          language: langOrUndefined(natLang)
        });
      }
      continue;
    }
    if (type === "NWN" || type === "NOW") {
      const ip = (obj.InterestedPartyNumber || "").trim();
      const lastName = (obj.WriterLastName || "").trim();
      const firstName = (obj.WriterFirstName || "").trim();
      const lang = (obj.LanguageCode || "").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || lastName;
      if (ip && fullName) {
        model.writerLocalNames[ip] = { name: fullName, language: langOrUndefined(lang) };
      }
      continue;
    }
    if (type === "NPN") {
      const ip = (obj.InterestedPartyNumber || "").trim();
      const pubName = (obj.PublisherName || "").trim();
      const lang = (obj.LanguageCode || "").trim();
      if (ip && pubName) {
        model.publisherLocalNames[ip] = { name: pubName, language: langOrUndefined(lang) };
      }
      continue;
    }
    if (type === "SPU" || type === "OPU") {
      if (type === "OPU") {
        currentPublisherChain = null;
      }
      handleSpuOpu(type, obj);
      continue;
    }
    if (type === "SPT" || type === "OPT") {
      applyPublisherTerritory(type === "SPT" ? "submitter" : "other", obj, type);
      continue;
    }
    if (type === "SWR" || type === "OWR") {
      startWriterGroup(type, obj);
      continue;
    }
    if (type === "SWT" || type === "OWT") {
      handleWriterTerritory(obj);
      continue;
    }
    if (type === "PWR") {
      handlePwr(obj);
      continue;
    }
    if (type === "ARI") {
      model.ariRecords.push({
        societyCode: obj.SocietyNumber || "",
        workNumber: obj.WorkNumber || void 0,
        typeOfRight: obj.TypeOfRight || "",
        subjectCode: obj.SubjectCode || void 0,
        note: obj.Note?.trim() || void 0
      });
    }
  }
  dedupeTitles(model);
  return model;
}
__name(buildWorkModel, "buildWorkModel");
function langOrUndefined(lang) {
  return lang || void 0;
}
__name(langOrUndefined, "langOrUndefined");
function dedupeTitles(model) {
  if (!model.titles.length) return;
  const seen = /* @__PURE__ */ new Set();
  model.titles = model.titles.filter((wt) => {
    const key = `${wt.value}|${wt.type || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
__name(dedupeTitles, "dedupeTitles");
function createCombinedPublisherRegistry(model) {
  const combined = new PublisherRegistry();
  for (const chain of model.submitterPublisherChains) {
    combined.addChain(chain);
  }
  for (const chain of model.otherPublisherChains) {
    combined.addChain(chain);
  }
  return combined;
}
__name(createCombinedPublisherRegistry, "createCombinedPublisherRegistry");

// src/cwr-sdk/mapper/workModel/projectCanonical.ts
function projectCanonicalFromModel(model) {
  const submitterRegistry = new PublisherRegistry();
  for (const chain of model.submitterPublisherChains) {
    submitterRegistry.addChain(chain);
  }
  const otherRegistry = new PublisherRegistry();
  for (const chain of model.otherPublisherChains) {
    otherRegistry.addChain(chain);
  }
  const combinedRegistry = createCombinedPublisherRegistry(model);
  const linkedPublishers = /* @__PURE__ */ new Set();
  const interestedParties = [];
  const linkWriterGroups = /* @__PURE__ */ __name((groups, registry) => {
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
  }, "linkWriterGroups");
  linkWriterGroups(model.controlledWriterGroups, submitterRegistry);
  linkWriterGroups(model.otherWriterGroups, otherRegistry);
  applyGemaRoleSplits(model, interestedParties);
  attachLocalNames(model, interestedParties, combinedRegistry);
  const cleanupParticipant = /* @__PURE__ */ __name((p) => {
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
  }, "cleanupParticipant");
  interestedParties.forEach(cleanupParticipant);
  const uniquePublishers = combinedRegistry.allPublisherParties();
  uniquePublishers.forEach(cleanupParticipant);
  for (const publisher of uniquePublishers) {
    if (publisher.role === "E" && !linkedPublishers.has(publisher)) {
      if (!interestedParties.includes(publisher)) {
        interestedParties.push(publisher);
      }
    }
  }
  const header = Object.keys(model.header).length > 0 ? model.header : void 0;
  return {
    header,
    works: [
      {
        messages: model.messages,
        titles: model.titles,
        identifiers: model.identifiers,
        flags: model.flags,
        parties: interestedParties,
        recordings: model.recordings
      }
    ]
  };
}
__name(projectCanonicalFromModel, "projectCanonicalFromModel");
function applyGemaRoleSplits(model, parties) {
  for (const ari of model.ariRecords) {
    if (ari.societyCode !== "035" || ari.subjectCode !== "GW" || !ari.note) continue;
    const note = ari.note.trim();
    const typeMMatch = note.match(/^M\|(\d{5})\|T\|(\d{5})$/);
    if (typeMMatch) {
      const music = parseInt(typeMMatch[1], 10) / 100;
      const text = parseInt(typeMMatch[2], 10) / 100;
      for (const party of parties) {
        if (party.role === "CA") {
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
        if (party.role === "CA") {
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
__name(applyGemaRoleSplits, "applyGemaRoleSplits");
function attachLocalNames(model, parties, registry) {
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
    const localizedName = model.publisherLocalNames[ip] || model.publisherLocalNames[ip.replace(/^0+/, "")];
    if (localizedName) {
      publisher.nameDomestic = localizedName.name;
      if (localizedName.language) {
        publisher.nameScript = localizedName.language;
      }
    }
  }
}
__name(attachLocalNames, "attachLocalNames");
function toCanonicalFromLines(lines) {
  const model = buildWorkModel(lines);
  return projectCanonicalFromModel(model);
}
__name(toCanonicalFromLines, "toCanonicalFromLines");

// src/cwr-sdk/mapper/canonicalMapper.ts
function toCanonical(previewData) {
  const { lines = [] } = previewData || {};
  return toCanonicalFromLines(lines);
}
__name(toCanonical, "toCanonical");

// src/cwr-sdk/mapper/schemas/schemaV1.ts
var schemaV1 = {
  id: "cwr-json-v1-0",
  label: "CWR-JSON Schema v1.0",
  description: "Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits.",
  version: "1.0.0",
  jsonSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://example.org/cwr-json/schema-v1.0.json",
    title: "CWR-JSON Schema v1.0",
    type: "object",
    properties: {
      header: { type: "object" },
      works: {
        type: "array",
        items: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: { type: "string" },
                  type: { type: "string" },
                  language: { type: "string" }
                },
                required: ["value"]
              }
            },
            identifiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source: { type: "string" },
                  // e.g., iswc, submitterWorkNumber, proprietary
                  value: { type: "string" }
                },
                required: ["source", "value"]
              }
            },
            messages: { type: "object" },
            flags: { type: "object" },
            parties: { type: "array", items: { type: "object" } },
            recordings: { type: "array" }
          },
          required: []
        }
      }
    },
    required: ["works"]
  },
  convert(parsed) {
    const output = {
      header: parsed.header,
      works: []
    };
    for (const work of parsed.works) {
      output.works.push({
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        parties: work.parties,
        recordings: work.recordings
      });
    }
    return output;
  }
};

// src/cwr-sdk/parser/tokenizer.ts
function tokenize(raw) {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim().length > 0);
}
__name(tokenize, "tokenize");

// src/cwr-sdk/validators/recordOrderValidator.ts
function validateRecordOrder(lines) {
  const ignore = /* @__PURE__ */ new Set(["HDR", "GRH", "GRT", "TRL"]);
  const slots = [
    { type: ["NWR", "REV", "ISW", "EXC"], block: 0 },
    { type: ["SPU"], block: 1 },
    // Publisher Block Starts
    { type: ["NPN"], block: 1 },
    { type: ["SPT"], block: 1 },
    { type: ["OPT"], block: 1 },
    { type: ["OPU"], block: 2 },
    // Other Publisher Block
    { type: ["NPN"], block: 2 },
    { type: ["OPT"], block: 2 },
    { type: ["SWR"], block: 3 },
    // Writer Block Starts
    { type: ["NWN"], block: 3 },
    { type: ["SWT"], block: 3 },
    { type: ["PWR"], block: 3 },
    { type: ["OWR"], block: 4 },
    // Other Writer Block
    { type: ["NWN"], block: 4 },
    { type: ["OWT"], block: 4 },
    { type: ["PWR"], block: 4 },
    { type: ["ALT"], block: 5 },
    // Titles Block Starts
    { type: ["NAT"], block: 5 },
    { type: ["EWT"], block: 5 },
    { type: ["NET"], block: 5 },
    { type: ["NOW"], block: 5 },
    { type: ["PER"], block: 6 },
    // Performance Data Block
    { type: ["NPR"], block: 6 },
    { type: ["REC"], block: 7 },
    // Recording Block
    { type: ["ORN"], block: 7 },
    { type: ["INS"], block: 7 },
    { type: ["IND"], block: 7 },
    { type: ["COM"], block: 7 },
    { type: ["NCT"], block: 7 },
    { type: ["NOW"], block: 7 },
    { type: ["ARI"], block: 8 },
    { type: ["XRF"], block: 8 }
  ];
  const loopStarters = /* @__PURE__ */ new Set(["SPU", "OPU", "SWR", "OWR", "ALT", "NAT", "PER", "REC"]);
  const problems = [];
  let currentSlotIdx = 0;
  let sawWorkStart = false;
  const assignedSlots = new Array(lines.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;
    if (["NWR", "REV", "ISW", "EXC"].includes(type)) {
      if (sawWorkStart) {
        problems.push(`Unexpected ${type} at line ${i + 1}; work blocks must start with a single NWR/REV/ISW/EXC.`);
      }
      sawWorkStart = true;
      currentSlotIdx = 0;
    }
    const potentialMatches = slots.map((s, idx) => s.type.includes(type) ? idx : -1).filter((idx) => idx !== -1);
    if (potentialMatches.length === 0) {
      problems.push(`Record "${type}" at line ${i + 1} is not recognized in CWR 2.1/2.2.`);
      continue;
    }
    let matchIdx = potentialMatches.find((idx) => idx >= currentSlotIdx);
    if (matchIdx === void 0) {
      const rewindIdx = potentialMatches.find((idx) => idx < currentSlotIdx);
      if (rewindIdx !== void 0) {
        const currentBlock = slots[currentSlotIdx].block;
        const targetBlock = slots[rewindIdx].block;
        if (loopStarters.has(type) && currentBlock === targetBlock) {
          matchIdx = rewindIdx;
        }
      }
    }
    if (matchIdx === void 0) {
      const idealIdx = potentialMatches[0];
      let blocker = null;
      for (let j = 0; j < i; j++) {
        if (assignedSlots[j] !== null && assignedSlots[j] > idealIdx) {
          blocker = { line: j + 1, type: getRecordType(lines[j]) };
          break;
        }
      }
      if (blocker) {
        problems.push(`Record "${type}" at line ${i + 1} is out of sequence; it should appear before "${blocker.type}" at line ${blocker.line}.`);
      } else {
        problems.push(`Out-of-sequence record "${type}" at line ${i + 1}.`);
      }
      continue;
    }
    currentSlotIdx = matchIdx;
    assignedSlots[i] = matchIdx;
  }
  return { ok: problems.length === 0, problems };
}
__name(validateRecordOrder, "validateRecordOrder");

// src/cwr-sdk/validators/sequenceOrderValidator.ts
function parseSeqFields(line) {
  if (!line || line.length < 19) return null;
  const txRaw = line.substring(3, 11);
  const recRaw = line.substring(11, 19);
  if (!/^\d{8}$/.test(txRaw) || !/^\d{8}$/.test(recRaw)) return null;
  return {
    transactionSeqRaw: txRaw,
    recordSeqRaw: recRaw,
    transactionSeq: parseInt(txRaw, 10),
    recordSeq: parseInt(recRaw, 10)
  };
}
__name(parseSeqFields, "parseSeqFields");
function validateSequenceNumbers(lines) {
  const ignore = /* @__PURE__ */ new Set(["HDR", "GRH", "GRT", "TRL"]);
  const problems = [];
  let expectedRecordSeq = 0;
  let transactionSeqSeen = null;
  let sawAnyNumberedRecord = false;
  let sawWorkStart = false;
  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;
    const seq = parseSeqFields(lines[i]);
    if (!seq) {
      continue;
    }
    sawAnyNumberedRecord = true;
    if (transactionSeqSeen === null) {
      transactionSeqSeen = seq.transactionSeqRaw;
    } else if (transactionSeqSeen !== seq.transactionSeqRaw) {
      problems.push(
        `TransactionSeq mismatch at line ${i + 1} (${type}): expected ${transactionSeqSeen} but got ${seq.transactionSeqRaw}.`
      );
    }
    const actual = seq.recordSeq;
    if (!sawWorkStart && ["NWR", "REV", "ISW", "EXC"].includes(type)) {
      sawWorkStart = true;
      if (actual !== 0) {
        problems.push(
          `Work-start record ${type} at line ${i + 1} must have RecordSeq 00000000, but got ${seq.recordSeqRaw}.`
        );
      }
      expectedRecordSeq = 0;
    }
    if (actual !== expectedRecordSeq) {
      problems.push(
        `RecordSeq mismatch at line ${i + 1} (${type}): expected ${String(expectedRecordSeq).padStart(8, "0")} but got ${seq.recordSeqRaw}.`
      );
      expectedRecordSeq = actual + 1;
    } else {
      expectedRecordSeq++;
    }
  }
  if (!sawAnyNumberedRecord) {
    return { ok: true, problems: [] };
  }
  return {
    ok: problems.length === 0,
    problems
  };
}
__name(validateSequenceNumbers, "validateSequenceNumbers");

// src/cwr-sdk/parser/blockExtractor.ts
function detectWorkRecordType(lines) {
  const grh = lines.find((l) => getRecordType(l) === "GRH");
  if (!grh) return "NWR";
  const transactionType = grh.substring(3, 6).trim();
  return transactionType === "REV" ? "REV" : "NWR";
}
__name(detectWorkRecordType, "detectWorkRecordType");
function splitIntoWorkBlocks(rawText) {
  const lines = tokenize(rawText);
  const hdr = lines.find((l) => getRecordType(l) === "HDR") || null;
  let lastGrh = null;
  const workRecordType = detectWorkRecordType(lines);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const type = getRecordType(line);
    if (type === "HDR") {
      continue;
    }
    if (type === "GRH") {
      lastGrh = line;
      continue;
    }
    if (type === workRecordType) {
      if (current) blocks.push(current);
      current = [];
      if (blocks.length === 0 && hdr) {
        current.push(hdr);
      }
      if (lastGrh) {
        current.push(lastGrh);
      }
    }
    if (current) current.push(line);
  }
  if (current && current.length > 0) {
    blocks.push(current);
  }
  return { hdr, workRecordType, blocks };
}
__name(splitIntoWorkBlocks, "splitIntoWorkBlocks");

// src/validation/schemaValidation.ts
import Ajv from "ajv";
import addFormats from "ajv-formats";

// src/cwr-sdk/json-schemas/cwr-json-schema-v1.0.schema.json
var cwr_json_schema_v1_0_schema_default = {
  $ref: "#/definitions/SchemaV1Output",
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    AgreementNumber: {
      additionalProperties: false,
      properties: {
        source: {
          type: "string"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "value"
      ],
      type: "object"
    },
    CanonicalParsedCwrFile: {
      $ref: "#/definitions/ParsedCwrFile"
    },
    CanonicalWork: {
      additionalProperties: false,
      properties: {
        flags: {
          $ref: "#/definitions/Flags"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        messages: {
          $ref: "#/definitions/Messages"
        },
        parties: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        rawRecords: {
          items: {
            type: "string"
          },
          type: "array"
        },
        recordings: {
          items: {
            $ref: "#/definitions/Recording"
          },
          type: "array"
        },
        titles: {
          items: {
            $ref: "#/definitions/WorkTitle"
          },
          type: "array"
        }
      },
      type: "object"
    },
    Flags: {
      additionalProperties: {},
      properties: {
        aiUsage: {
          type: "string"
        },
        anomalous: {
          type: "boolean"
        },
        fraudulent: {
          type: "boolean"
        }
      },
      type: "object"
    },
    HdrRecord: {
      additionalProperties: false,
      properties: {
        characterSet: {
          type: "string"
        },
        creationDate: {
          type: "string"
        },
        creationTime: {
          type: "string"
        },
        revision: {
          type: "string"
        },
        senderIdentifier: {
          type: "string"
        },
        senderName: {
          type: "string"
        },
        softwarePackage: {
          type: "string"
        },
        softwarePackageVersion: {
          type: "string"
        },
        transmissionDate: {
          type: "string"
        },
        version: {
          type: "string"
        }
      },
      type: "object"
    },
    Messages: {
      additionalProperties: {
        description: "Preview / society layers may add labels here; parser may add more fields over time"
      },
      properties: {
        changeRequest: {
          additionalProperties: {},
          type: "object"
        },
        msgs: {
          items: {
            additionalProperties: false,
            properties: {
              message: {
                type: "string"
              },
              status: {
                type: "string"
              }
            },
            type: "object"
          },
          type: "array"
        },
        relinquishment: {
          additionalProperties: false,
          properties: {
            indicator: {
              type: "string"
            }
          },
          required: [
            "indicator"
          ],
          type: "object"
        },
        revocation: {
          additionalProperties: false,
          properties: {
            indicator: {
              type: "string"
            },
            reason: {
              type: "string"
            }
          },
          required: [
            "indicator"
          ],
          type: "object"
        },
        schema: {
          type: "string"
        },
        schemaDescription: {
          type: "string"
        },
        societySpecific: {
          additionalProperties: {},
          type: "object"
        },
        type: {
          type: "string"
        }
      },
      type: "object"
    },
    ParsedCwrFile: {
      additionalProperties: false,
      properties: {
        header: {
          $ref: "#/definitions/HdrRecord"
        },
        works: {
          items: {
            $ref: "#/definitions/CanonicalWork"
          },
          type: "array"
        }
      },
      required: [
        "works"
      ],
      type: "object"
    },
    Participant: {
      additionalProperties: false,
      properties: {
        agreementNumber: {
          $ref: "#/definitions/AgreementNumber"
        },
        controlled: {
          enum: [
            "yes",
            "no"
          ],
          type: "string"
        },
        ipi: {
          type: "string"
        },
        name: {
          type: "string"
        },
        nameDomestic: {
          type: "string"
        },
        nameScript: {
          type: "string"
        },
        partyId: {
          type: "string"
        },
        relinquishment: {
          $ref: "#/definitions/Relinquishment"
        },
        representedBy: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        role: {
          $ref: "#/definitions/RoleCode"
        },
        roleName: {
          type: "string"
        },
        roleSplitM: {
          type: "number"
        },
        roleSplitT: {
          type: "number"
        },
        shares: {
          items: {
            $ref: "#/definitions/Share"
          },
          type: "array"
        },
        territories: {
          items: {
            $ref: "#/definitions/ParticipantTerritory"
          },
          type: "array"
        }
      },
      required: [
        "role"
      ],
      type: "object"
    },
    ParticipantTerritory: {
      additionalProperties: false,
      properties: {
        agreementNumber: {
          $ref: "#/definitions/AgreementNumber"
        },
        shareTypes: {
          items: {
            $ref: "#/definitions/TerritoryShareType"
          },
          type: "array"
        },
        territory: {
          additionalProperties: false,
          properties: {
            exclude: {
              items: {
                type: "string"
              },
              type: "array"
            },
            include: {
              items: {
                type: "string"
              },
              type: "array"
            }
          },
          required: [
            "include",
            "exclude"
          ],
          type: "object"
        }
      },
      required: [
        "territory",
        "shareTypes"
      ],
      type: "object"
    },
    Recording: {
      additionalProperties: false,
      properties: {
        isrc: {
          type: "string"
        },
        releases: {
          items: {
            $ref: "#/definitions/RecordingRelease"
          },
          type: "array"
        },
        title: {
          type: "string"
        },
        version: {
          type: "string"
        }
      },
      type: "object"
    },
    RecordingRelease: {
      additionalProperties: false,
      properties: {
        catno: {
          type: "string"
        },
        ean: {
          type: "string"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        label: {
          type: "string"
        },
        releaseDate: {
          type: "string"
        },
        title: {
          type: "string"
        }
      },
      type: "object"
    },
    Relinquishment: {
      additionalProperties: false,
      properties: {
        effectiveFrom: {
          type: "string"
        },
        note: {
          type: "string"
        },
        postTermCollectionUntil: {
          type: "string"
        },
        scope: {
          additionalProperties: false,
          properties: {
            rightsTypes: {
              items: {
                $ref: "#/definitions/RightsType"
              },
              type: "array"
            },
            territories: {
              additionalProperties: false,
              properties: {
                exclude: {
                  items: {
                    type: "string"
                  },
                  type: "array"
                },
                include: {
                  items: {
                    type: "string"
                  },
                  type: "array"
                }
              },
              required: [
                "include",
                "exclude"
              ],
              type: "object"
            }
          },
          required: [
            "rightsTypes",
            "territories"
          ],
          type: "object"
        }
      },
      required: [
        "effectiveFrom",
        "scope"
      ],
      type: "object"
    },
    RightsType: {
      enum: [
        "pr",
        "mr",
        "sr"
      ],
      type: "string"
    },
    RoleCode: {
      type: "string"
    },
    SchemaV1Messages: {
      allOf: [
        {
          $ref: "#/definitions/Messages"
        },
        {
          additionalProperties: true,
          properties: {
            schema: {
              type: "string"
            },
            schemaDescription: {
              type: "string"
            }
          },
          required: [
            "schema",
            "schemaDescription"
          ],
          type: "object"
        }
      ]
    },
    SchemaV1Output: {
      additionalProperties: false,
      properties: {
        header: {
          $ref: "#/definitions/HdrRecord"
        },
        works: {
          items: {
            $ref: "#/definitions/SchemaV1WorkOutput"
          },
          type: "array"
        }
      },
      required: [
        "works"
      ],
      type: "object"
    },
    SchemaV1WorkOutput: {
      additionalProperties: false,
      properties: {
        flags: {
          $ref: "#/definitions/Flags"
        },
        identifiers: {
          items: {
            $ref: "#/definitions/WorkIdentifier"
          },
          type: "array"
        },
        messages: {
          $ref: "#/definitions/SchemaV1Messages"
        },
        parties: {
          items: {
            $ref: "#/definitions/Participant"
          },
          type: "array"
        },
        recordings: {
          items: {
            $ref: "#/definitions/Recording"
          },
          type: "array"
        },
        titles: {
          items: {
            $ref: "#/definitions/WorkTitle"
          },
          type: "array"
        }
      },
      required: [
        "messages"
      ],
      type: "object"
    },
    Share: {
      additionalProperties: false,
      properties: {
        rightsType: {
          $ref: "#/definitions/RightsType"
        },
        society: {
          type: "string"
        },
        value: {
          type: "number"
        }
      },
      required: [
        "rightsType",
        "value"
      ],
      type: "object"
    },
    TerritoryShareType: {
      additionalProperties: false,
      properties: {
        shares: {
          items: {
            $ref: "#/definitions/Share"
          },
          type: "array"
        },
        type: {
          enum: [
            "own",
            "coll"
          ],
          type: "string"
        }
      },
      required: [
        "type",
        "shares"
      ],
      type: "object"
    },
    WorkIdentifier: {
      additionalProperties: false,
      properties: {
        source: {
          type: "string"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "source",
        "value"
      ],
      type: "object"
    },
    WorkTitle: {
      additionalProperties: false,
      properties: {
        language: {
          type: "string"
        },
        type: {
          type: "string"
        },
        value: {
          type: "string"
        }
      },
      required: [
        "value"
      ],
      type: "object"
    }
  }
};

// src/cwr-sdk/json-schemas/schemaAssetMap.ts
var schemaAssetMap = {
  "cwr-json-v1-0": cwr_json_schema_v1_0_schema_default
};
function getSchemaAsset(schemaId) {
  const schema = schemaAssetMap[schemaId];
  if (!schema) {
    throw new Error(`Missing generated schema asset for id: ${schemaId}`);
  }
  return schema;
}
__name(getSchemaAsset, "getSchemaAsset");

// src/validation/schemaValidation.ts
var DEFAULT_SCHEMA_ID = "cwr-json-v1-0";
var ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);
var validatorCache = /* @__PURE__ */ new Map();
function normalizeErrors(errors) {
  if (!errors?.length) return [];
  return errors.map((err, index) => formatAjvError(err, index + 1));
}
__name(normalizeErrors, "normalizeErrors");
function formatPath(path) {
  return path.length ? path : "/";
}
__name(formatPath, "formatPath");
function escapeJsonPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
__name(escapeJsonPointerSegment, "escapeJsonPointerSegment");
function appendPathSegment(basePath, segment) {
  const normalized = formatPath(basePath);
  const escaped = escapeJsonPointerSegment(segment);
  return normalized === "/" ? `/${escaped}` : `${normalized}/${escaped}`;
}
__name(appendPathSegment, "appendPathSegment");
function getExpectedHint(err) {
  if (err.keyword === "type" && typeof err.params === "object" && err.params && "type" in err.params) {
    return `expected type ${err.params.type}`;
  }
  if (err.keyword === "required" && typeof err.params === "object" && err.params && "missingProperty" in err.params) {
    return `expected required property ${err.params.missingProperty}`;
  }
  if (err.keyword === "additionalProperties" && typeof err.params === "object" && err.params && "additionalProperty" in err.params) {
    return `unexpected property ${err.params.additionalProperty}`;
  }
  return null;
}
__name(getExpectedHint, "getExpectedHint");
function formatAjvError(err, order) {
  let path = formatPath(err.instancePath);
  if (err.keyword === "required" && typeof err.params === "object" && err.params && "missingProperty" in err.params) {
    path = appendPathSegment(path, String(err.params.missingProperty));
  }
  const expectedHint = getExpectedHint(err);
  const keyword = err.keyword ? ` [${err.keyword}]` : "";
  const message = err.message || "invalid value";
  if (expectedHint) {
    return `${order}. ${path}${keyword}: ${message}; ${expectedHint}`;
  }
  return `${order}. ${path}${keyword}: ${message}`;
}
__name(formatAjvError, "formatAjvError");
function getValidator(schemaId = DEFAULT_SCHEMA_ID) {
  const cached = validatorCache.get(schemaId);
  if (cached) return cached;
  const validator = ajv.compile(getSchemaAsset(schemaId));
  validatorCache.set(schemaId, validator);
  return validator;
}
__name(getValidator, "getValidator");
function validateCwrJson(payload, mode = "strict", schemaId = DEFAULT_SCHEMA_ID) {
  try {
    const validator = getValidator(schemaId);
    const valid = Boolean(validator(payload));
    const errors = normalizeErrors(validator.errors);
    if (mode === "advisory") {
      return { valid: true, errors };
    }
    return { valid, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [`/: validation setup error - ${message}`]
    };
  }
}
__name(validateCwrJson, "validateCwrJson");
function validateParsedCwr(payload, mode = "strict") {
  return validateCwrJson(payload, mode);
}
__name(validateParsedCwr, "validateParsedCwr");

// src/cwr-sdk/validators/filenameValidator.ts
function validateCwrFilename(name) {
  if (/\.cwr$/i.test(name)) return null;
  const re = /^CW(\d{2})(\d{2}|\d{4})([A-Z0-9]{2,3})_([A-Z0-9]{2,3})\.V(\d{2})$/i;
  if (!re.test(name)) {
    return `Invalid filename. Expected convention: CWyynnnnsss_rrr.Vxx (e.g. CW250312BOU_000.V21). Got: "${name}".`;
  }
  return null;
}
__name(validateCwrFilename, "validateCwrFilename");

// src/validation/fileValidation.ts
function toValidationResult(ok, problems) {
  return { valid: ok, errors: problems };
}
__name(toValidationResult, "toValidationResult");
function validateCwrFilename2(filename) {
  const message = validateCwrFilename(filename);
  return message ? { valid: false, errors: [message] } : { valid: true, errors: [] };
}
__name(validateCwrFilename2, "validateCwrFilename");
function getWorkBlocks(cwrContent, scope) {
  const { blocks } = splitIntoWorkBlocks(cwrContent);
  if (blocks.length === 0) return [];
  return scope === "first" ? [blocks[0]] : blocks;
}
__name(getWorkBlocks, "getWorkBlocks");
function validateCwrRecordOrder(cwrContent, scope = "all") {
  const blocks = getWorkBlocks(cwrContent, scope);
  if (blocks.length === 0) {
    return { valid: false, errors: ["No work blocks found in CWR content."] };
  }
  const errors = [];
  for (let i = 0; i < blocks.length; i++) {
    const { ok, problems } = validateRecordOrder(blocks[i]);
    if (!ok) {
      const prefix = blocks.length > 1 ? `Work block ${i + 1}: ` : "";
      errors.push(...problems.map((p) => `${prefix}${p}`));
    }
  }
  return toValidationResult(errors.length === 0, errors);
}
__name(validateCwrRecordOrder, "validateCwrRecordOrder");
function validateCwrSequence(cwrContent, scope = "all") {
  const blocks = getWorkBlocks(cwrContent, scope);
  if (blocks.length === 0) {
    return { valid: false, errors: ["No work blocks found in CWR content."] };
  }
  const errors = [];
  for (let i = 0; i < blocks.length; i++) {
    const { ok, problems } = validateSequenceNumbers(blocks[i]);
    if (!ok) {
      const prefix = blocks.length > 1 ? `Work block ${i + 1}: ` : "";
      errors.push(...problems.map((p) => `${prefix}${p}`));
    }
  }
  return toValidationResult(errors.length === 0, errors);
}
__name(validateCwrSequence, "validateCwrSequence");
function validateCwrEdi(cwrContent, filename, options = {}) {
  const {
    filename: checkFilename = Boolean(filename),
    recordOrder: checkOrder = true,
    sequence: checkSequence = true,
    scope = "all"
  } = options;
  const filenameResult = checkFilename && filename !== void 0 ? validateCwrFilename2(filename) : null;
  const recordOrderResult = checkOrder ? validateCwrRecordOrder(cwrContent, scope) : null;
  const sequenceResult = checkSequence ? validateCwrSequence(cwrContent, scope) : null;
  const valid = (filenameResult?.valid ?? true) && (recordOrderResult?.valid ?? true) && (sequenceResult?.valid ?? true);
  return {
    valid,
    filename: filenameResult,
    recordOrder: recordOrderResult,
    sequence: sequenceResult
  };
}
__name(validateCwrEdi, "validateCwrEdi");

// src/index.ts
function parseAllWorks(raw) {
  const { hdr, blocks } = splitIntoWorkBlocks(raw);
  if (blocks.length === 0) {
    return toCanonical({ lines: [] });
  }
  const works = [];
  let header;
  for (let i = 0; i < blocks.length; i++) {
    const lines = hdr && i > 0 ? [hdr, ...blocks[i]] : blocks[i];
    const parsed = toCanonical({ lines });
    if (i === 0) header = parsed.header;
    works.push(...parsed.works);
  }
  return { header, works };
}
__name(parseAllWorks, "parseAllWorks");
function parseCwr(cwrContent) {
  if (typeof cwrContent !== "string") {
    throw new TypeError("parseCwr expects a string containing CWR file contents");
  }
  return schemaV1.convert(parseAllWorks(cwrContent));
}
__name(parseCwr, "parseCwr");
export {
  parseCwr,
  validateCwrEdi,
  validateCwrFilename2 as validateCwrFilename,
  validateCwrJson,
  validateCwrRecordOrder,
  validateCwrSequence,
  validateParsedCwr
};
//# sourceMappingURL=index.js.map