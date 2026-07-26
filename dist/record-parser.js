var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

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
  ],
  ACK: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "CreationDate", start: 20, length: 8, type: "N", mandatory: true },
    { label: "CreationTime", start: 28, length: 6, type: "N", mandatory: true },
    { label: "OriginalGroupId", start: 34, length: 5, type: "N", mandatory: true },
    { label: "OriginalTransactionSeq", start: 39, length: 8, type: "N", mandatory: true },
    { label: "OriginalTransactionType", start: 47, length: 3, type: "L", mandatory: true },
    { label: "CreationTitle", start: 50, length: 60, type: "A", mandatory: false },
    { label: "SubmitterCreationNumber", start: 110, length: 20, type: "A", mandatory: false },
    { label: "RecipientCreationNumber", start: 130, length: 20, type: "A", mandatory: false },
    { label: "ProcessingDate", start: 150, length: 8, type: "N", mandatory: true },
    { label: "TransactionStatus", start: 158, length: 2, type: "L", mandatory: true }
  ],
  MSG: [
    { label: "RecordType", start: 1, length: 3, type: "A", mandatory: true },
    { label: "TransactionSeq", start: 4, length: 8, type: "N", mandatory: true },
    { label: "RecordSeq", start: 12, length: 8, type: "N", mandatory: true },
    { label: "MessageType", start: 20, length: 1, type: "L", mandatory: true },
    { label: "OriginalRecordSequence", start: 21, length: 8, type: "N", mandatory: true },
    { label: "MessageRecordType", start: 29, length: 3, type: "A", mandatory: true },
    { label: "MessageLevel", start: 32, length: 1, type: "L", mandatory: true },
    { label: "ValidationNumber", start: 33, length: 3, type: "A", mandatory: true },
    { label: "MessageText", start: 36, length: 150, type: "A", mandatory: true }
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
export {
  parseRecordLine,
  recordDefinitions
};
//# sourceMappingURL=record-parser.js.map