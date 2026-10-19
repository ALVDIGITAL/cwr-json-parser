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
  const filtered = (shares || []).filter((s) => s.value > 0);
  if (!filtered.length) return;
  let shareTypeEntry = territoryEntry.shareTypes.find((st) => st.type === type);
  if (!shareTypeEntry) {
    shareTypeEntry = { type, shares: [] };
    territoryEntry.shareTypes.push(shareTypeEntry);
  }
  shareTypeEntry.shares = filtered;
}
__name(addShareType, "addShareType");
function normalizeSharesKey(shares = []) {
  return shares.filter((s) => s.value > 0).map((s) => `${s.rightsType || ""}:${s.value ?? ""}:${s.society || ""}`).sort().join("|");
}
__name(normalizeSharesKey, "normalizeSharesKey");
function getNonZeroCollShares(territoryEntry) {
  const coll = (territoryEntry.shareTypes || []).find((st) => st.type === "coll");
  return (coll?.shares || []).filter((s) => s.value > 0);
}
__name(getNonZeroCollShares, "getNonZeroCollShares");
function findCollTerritoryByShareKey(participant, shareKey) {
  if (!shareKey) return void 0;
  return (participant.territories || []).find((t) => {
    const nonZero = getNonZeroCollShares(t);
    return nonZero.length > 0 && normalizeSharesKey(nonZero) === shareKey;
  });
}
__name(findCollTerritoryByShareKey, "findCollTerritoryByShareKey");
function findPendingCollTerritory(participant) {
  return (participant.territories || []).find((t) => {
    const hasTis = (t.territory?.include?.length || 0) > 0 || (t.territory?.exclude?.length || 0) > 0;
    return hasTis && getNonZeroCollShares(t).length === 0;
  });
}
__name(findPendingCollTerritory, "findPendingCollTerritory");
function findLastCollTerritoryWithShares(participant) {
  const territories = participant.territories || [];
  for (let i = territories.length - 1; i >= 0; i--) {
    if (getNonZeroCollShares(territories[i]).length > 0) {
      return territories[i];
    }
  }
  return void 0;
}
__name(findLastCollTerritoryWithShares, "findLastCollTerritoryWithShares");
function mergeTis(territoryEntry, incl, tis) {
  if (incl) {
    territoryEntry.territory.include = Array.from(
      /* @__PURE__ */ new Set([...territoryEntry.territory.include || [], ...tis])
    );
  } else {
    territoryEntry.territory.exclude = Array.from(
      /* @__PURE__ */ new Set([...territoryEntry.territory.exclude || [], ...tis])
    );
  }
}
__name(mergeTis, "mergeTis");
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
  const nonZeroShares = (collShares || []).filter((s) => s.value > 0);
  const shareKey = normalizeSharesKey(nonZeroShares);
  const isScopeOnly = tis.length > 0 && nonZeroShares.length === 0;
  let territoryEntry;
  if (nonZeroShares.length > 0) {
    territoryEntry = findCollTerritoryByShareKey(participant, shareKey) || findPendingCollTerritory(participant);
    if (!territoryEntry) {
      territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
    } else {
      mergeTis(territoryEntry, incl, tis);
    }
    addShareType(territoryEntry, "coll", nonZeroShares);
    participant._activeCollTerritory = territoryEntry;
  } else if (isScopeOnly) {
    territoryEntry = participant._activeCollTerritory || findLastCollTerritoryWithShares(participant) || findPendingCollTerritory(participant);
    if (!territoryEntry) {
      territoryEntry = findOrCreateTerritoryEntry(participant, incl ? tis : [], !incl ? tis : []);
    } else {
      mergeTis(territoryEntry, incl, tis);
    }
  } else {
    return null;
  }
  if (agreementNumber) {
    territoryEntry.agreementNumber = agreementNumber;
  }
  return territoryEntry;
}
__name(upsertCollectionTerritory, "upsertCollectionTerritory");

// src/cwr-sdk/lookups/cwr_lookup_data_types_v1.0.json
var cwr_lookup_data_types_v1_0_default = {
  $id: "cwr_lookup_data_types_v1.0",
  version: "1.0.0",
  revision: "r1",
  source: "CISAC TIS database export (CISAC-TIS.xlsx, sheet en, 241 territories)",
  cisacSource: "CWR08-3615R2_CWR_2x_Lookup_Table_2026-03-31_EN.xml",
  cisacGeneratedAt: "2026-06-15",
  generatedAt: "2026-07-26",
  tisEntryCount: 241,
  sets: {
    roleCodes: [
      "A",
      "AD",
      "AM",
      "AQ",
      "AR",
      "C",
      "CA",
      "E",
      "ES",
      "OP",
      "PA",
      "PRF",
      "SA",
      "SE",
      "SR",
      "TR",
      "WR"
    ],
    titleTypes: [
      "AL",
      "ALT",
      "AT",
      "ET",
      "FT",
      "IT",
      "NAT",
      "OL",
      "OT",
      "PT",
      "RT",
      "TE",
      "TT",
      "UT"
    ],
    aiUsageIndicators: [
      "A",
      "B",
      "M",
      "N",
      "T",
      "U",
      "Y"
    ],
    characterSets: [
      "ISO-8859-1",
      "ISO-8859-10",
      "ISO-8859-2",
      "ISO-8859-3",
      "ISO-8859-4",
      "ISO-8859-5",
      "ISO-8859-6",
      "ISO-8859-7",
      "ISO-8859-8",
      "ISO-8859-9"
    ],
    revocationReasons: [
      "AN",
      "NC",
      "NE",
      "NM"
    ],
    anomalousWorkReasons: [
      "IPS",
      "UNA"
    ],
    societyCodes: [
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
      "009",
      "010",
      "011",
      "012",
      "013",
      "014",
      "015",
      "016",
      "017",
      "018",
      "019",
      "020",
      "021",
      "022",
      "023",
      "024",
      "025",
      "026",
      "027",
      "028",
      "029",
      "030",
      "031",
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039",
      "040",
      "041",
      "042",
      "043",
      "044",
      "045",
      "046",
      "047",
      "048",
      "049",
      "050",
      "051",
      "052",
      "053",
      "054",
      "055",
      "056",
      "057",
      "058",
      "059",
      "060",
      "061",
      "062",
      "063",
      "064",
      "065",
      "066",
      "067",
      "068",
      "069",
      "070",
      "071",
      "072",
      "073",
      "074",
      "075",
      "076",
      "077",
      "078",
      "079",
      "080",
      "081",
      "082",
      "083",
      "084",
      "085",
      "086",
      "087",
      "088",
      "089",
      "090",
      "091",
      "092",
      "093",
      "094",
      "095",
      "096",
      "097",
      "098",
      "099",
      "1",
      "10",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "11",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "12",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "13",
      "130",
      "131",
      "132",
      "133",
      "134",
      "135",
      "136",
      "137",
      "138",
      "139",
      "14",
      "140",
      "141",
      "142",
      "143",
      "144",
      "145",
      "146",
      "147",
      "148",
      "149",
      "15",
      "150",
      "151",
      "152",
      "153",
      "154",
      "155",
      "156",
      "157",
      "158",
      "159",
      "16",
      "160",
      "161",
      "162",
      "163",
      "164",
      "166",
      "167",
      "168",
      "169",
      "17",
      "170",
      "171",
      "172",
      "173",
      "174",
      "175",
      "176",
      "177",
      "178",
      "179",
      "18",
      "180",
      "181",
      "182",
      "183",
      "184",
      "185",
      "186",
      "187",
      "188",
      "189",
      "19",
      "190",
      "191",
      "192",
      "193",
      "194",
      "195",
      "196",
      "197",
      "198",
      "199",
      "2",
      "20",
      "200",
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "21",
      "210",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "22",
      "220",
      "221",
      "222",
      "223",
      "224",
      "225",
      "226",
      "227",
      "228",
      "229",
      "23",
      "230",
      "231",
      "232",
      "233",
      "234",
      "235",
      "236",
      "237",
      "238",
      "239",
      "24",
      "240",
      "241",
      "242",
      "243",
      "244",
      "245",
      "246",
      "247",
      "248",
      "249",
      "25",
      "250",
      "251",
      "252",
      "253",
      "254",
      "255",
      "256",
      "257",
      "258",
      "259",
      "26",
      "260",
      "261",
      "262",
      "263",
      "264",
      "265",
      "266",
      "267",
      "268",
      "269",
      "27",
      "270",
      "271",
      "272",
      "273",
      "274",
      "275",
      "276",
      "277",
      "278",
      "279",
      "28",
      "280",
      "282",
      "283",
      "284",
      "285",
      "286",
      "287",
      "288",
      "289",
      "29",
      "290",
      "291",
      "292",
      "293",
      "294",
      "295",
      "296",
      "297",
      "298",
      "299",
      "3",
      "30",
      "300",
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "309",
      "31",
      "310",
      "311",
      "312",
      "313",
      "314",
      "315",
      "316",
      "317",
      "318",
      "319",
      "32",
      "320",
      "321",
      "322",
      "323",
      "324",
      "325",
      "326",
      "327",
      "328",
      "329",
      "33",
      "330",
      "331",
      "332",
      "333",
      "334",
      "335",
      "336",
      "337",
      "338",
      "339",
      "34",
      "340",
      "341",
      "342",
      "343",
      "344",
      "345",
      "346",
      "347",
      "348",
      "349",
      "35",
      "350",
      "351",
      "352",
      "353",
      "354",
      "355",
      "356",
      "357",
      "358",
      "359",
      "36",
      "360",
      "361",
      "362",
      "363",
      "37",
      "38",
      "39",
      "4",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
      "49",
      "5",
      "50",
      "51",
      "52",
      "53",
      "54",
      "55",
      "555",
      "56",
      "57",
      "58",
      "59",
      "590",
      "591",
      "592",
      "6",
      "60",
      "61",
      "62",
      "63",
      "635",
      "64",
      "65",
      "658",
      "66",
      "67",
      "672",
      "68",
      "69",
      "7",
      "70",
      "700",
      "701",
      "702",
      "703",
      "704",
      "705",
      "707",
      "708",
      "71",
      "710",
      "72",
      "73",
      "74",
      "75",
      "758",
      "76",
      "77",
      "775",
      "776",
      "777",
      "778",
      "779",
      "78",
      "780",
      "781",
      "782",
      "783",
      "784",
      "785",
      "786",
      "787",
      "788",
      "789",
      "79",
      "790",
      "791",
      "792",
      "793",
      "8",
      "80",
      "81",
      "82",
      "83",
      "84",
      "85",
      "86",
      "87",
      "88",
      "888",
      "89",
      "9",
      "90",
      "91",
      "92",
      "93",
      "94",
      "95",
      "96",
      "97",
      "98",
      "99"
    ],
    languageCodes: [
      "AA",
      "AB",
      "AF",
      "AM",
      "AR",
      "AS",
      "AY",
      "AZ",
      "BA",
      "BE",
      "BG",
      "BH",
      "BI",
      "BN",
      "BO",
      "BR",
      "CA",
      "CO",
      "CS",
      "CY",
      "DA",
      "DE",
      "DZ",
      "EL",
      "EN",
      "EO",
      "ES",
      "ET",
      "EU",
      "FA",
      "FI",
      "FJ",
      "FO",
      "FR",
      "FY",
      "GA",
      "GD",
      "GL",
      "GN",
      "GU",
      "HA",
      "HI",
      "HR",
      "HU",
      "HW",
      "HY",
      "IA",
      "IE",
      "IK",
      "IN",
      "IS",
      "IT",
      "IW",
      "JA",
      "JI",
      "JW",
      "KA",
      "KK",
      "KL",
      "KM",
      "KN",
      "KO",
      "KS",
      "KU",
      "KY",
      "LA",
      "LN",
      "LO",
      "LT",
      "LV",
      "MG",
      "MI",
      "MK",
      "ML",
      "MN",
      "MO",
      "MR",
      "MS",
      "MT",
      "MY",
      "NA",
      "ND",
      "NE",
      "NL",
      "NO",
      "NS",
      "OC",
      "OM",
      "OR",
      "PA",
      "PL",
      "PM",
      "PS",
      "PT",
      "QU",
      "RM",
      "RN",
      "RO",
      "RU",
      "RW",
      "SA",
      "SD",
      "SG",
      "SH",
      "SI",
      "SK",
      "SL",
      "SM",
      "SN",
      "SO",
      "SQ",
      "SR",
      "SS",
      "ST",
      "SU",
      "SV",
      "SW",
      "TA",
      "TE",
      "TG",
      "TH",
      "TI",
      "TK",
      "TL",
      "TN",
      "TO",
      "TR",
      "TS",
      "TT",
      "TW",
      "UK",
      "UR",
      "UZ",
      "VE",
      "VI",
      "VO",
      "WO",
      "XH",
      "YO",
      "ZH",
      "ZU"
    ],
    rightsTypes: [
      "pr",
      "mr",
      "sr"
    ],
    shareTypes: [
      "own",
      "coll"
    ],
    controlled: [
      "yes",
      "no"
    ],
    identifierSources: [
      "001",
      "002",
      "003",
      "004",
      "005",
      "006",
      "007",
      "008",
      "009",
      "010",
      "011",
      "012",
      "013",
      "014",
      "015",
      "016",
      "017",
      "018",
      "019",
      "020",
      "021",
      "022",
      "023",
      "024",
      "025",
      "026",
      "027",
      "028",
      "029",
      "030",
      "031",
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039",
      "040",
      "041",
      "042",
      "043",
      "044",
      "045",
      "046",
      "047",
      "048",
      "049",
      "050",
      "051",
      "052",
      "053",
      "054",
      "055",
      "056",
      "057",
      "058",
      "059",
      "060",
      "061",
      "062",
      "063",
      "064",
      "065",
      "066",
      "067",
      "068",
      "069",
      "070",
      "071",
      "072",
      "073",
      "074",
      "075",
      "076",
      "077",
      "078",
      "079",
      "080",
      "081",
      "082",
      "083",
      "084",
      "085",
      "086",
      "087",
      "088",
      "089",
      "090",
      "091",
      "092",
      "093",
      "094",
      "095",
      "096",
      "097",
      "098",
      "099",
      "1",
      "10",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "11",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "12",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "13",
      "130",
      "131",
      "132",
      "133",
      "134",
      "135",
      "136",
      "137",
      "138",
      "139",
      "14",
      "140",
      "141",
      "142",
      "143",
      "144",
      "145",
      "146",
      "147",
      "148",
      "149",
      "15",
      "150",
      "151",
      "152",
      "153",
      "154",
      "155",
      "156",
      "157",
      "158",
      "159",
      "16",
      "160",
      "161",
      "162",
      "163",
      "164",
      "166",
      "167",
      "168",
      "169",
      "17",
      "170",
      "171",
      "172",
      "173",
      "174",
      "175",
      "176",
      "177",
      "178",
      "179",
      "18",
      "180",
      "181",
      "182",
      "183",
      "184",
      "185",
      "186",
      "187",
      "188",
      "189",
      "19",
      "190",
      "191",
      "192",
      "193",
      "194",
      "195",
      "196",
      "197",
      "198",
      "199",
      "2",
      "20",
      "200",
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "21",
      "210",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "22",
      "220",
      "221",
      "222",
      "223",
      "224",
      "225",
      "226",
      "227",
      "228",
      "229",
      "23",
      "230",
      "231",
      "232",
      "233",
      "234",
      "235",
      "236",
      "237",
      "238",
      "239",
      "24",
      "240",
      "241",
      "242",
      "243",
      "244",
      "245",
      "246",
      "247",
      "248",
      "249",
      "25",
      "250",
      "251",
      "252",
      "253",
      "254",
      "255",
      "256",
      "257",
      "258",
      "259",
      "26",
      "260",
      "261",
      "262",
      "263",
      "264",
      "265",
      "266",
      "267",
      "268",
      "269",
      "27",
      "270",
      "271",
      "272",
      "273",
      "274",
      "275",
      "276",
      "277",
      "278",
      "279",
      "28",
      "280",
      "282",
      "283",
      "284",
      "285",
      "286",
      "287",
      "288",
      "289",
      "29",
      "290",
      "291",
      "292",
      "293",
      "294",
      "295",
      "296",
      "297",
      "298",
      "299",
      "3",
      "30",
      "300",
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "309",
      "31",
      "310",
      "311",
      "312",
      "313",
      "314",
      "315",
      "316",
      "317",
      "318",
      "319",
      "32",
      "320",
      "321",
      "322",
      "323",
      "324",
      "325",
      "326",
      "327",
      "328",
      "329",
      "33",
      "330",
      "331",
      "332",
      "333",
      "334",
      "335",
      "336",
      "337",
      "338",
      "339",
      "34",
      "340",
      "341",
      "342",
      "343",
      "344",
      "345",
      "346",
      "347",
      "348",
      "349",
      "35",
      "350",
      "351",
      "352",
      "353",
      "354",
      "355",
      "356",
      "357",
      "358",
      "359",
      "36",
      "360",
      "361",
      "362",
      "363",
      "37",
      "38",
      "39",
      "4",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
      "47",
      "48",
      "49",
      "5",
      "50",
      "51",
      "52",
      "53",
      "54",
      "55",
      "555",
      "56",
      "57",
      "58",
      "59",
      "590",
      "591",
      "592",
      "6",
      "60",
      "61",
      "62",
      "63",
      "635",
      "64",
      "65",
      "658",
      "66",
      "67",
      "672",
      "68",
      "69",
      "7",
      "70",
      "700",
      "701",
      "702",
      "703",
      "704",
      "705",
      "707",
      "708",
      "71",
      "710",
      "72",
      "73",
      "74",
      "75",
      "758",
      "76",
      "77",
      "775",
      "776",
      "777",
      "778",
      "779",
      "78",
      "780",
      "781",
      "782",
      "783",
      "784",
      "785",
      "786",
      "787",
      "788",
      "789",
      "79",
      "790",
      "791",
      "792",
      "793",
      "8",
      "80",
      "81",
      "82",
      "83",
      "84",
      "85",
      "86",
      "87",
      "88",
      "888",
      "89",
      "9",
      "90",
      "91",
      "92",
      "93",
      "94",
      "95",
      "96",
      "97",
      "98",
      "99",
      "catalogNumber",
      "ean",
      "isrc",
      "iswc",
      "proprietary",
      "submitterWorkNumber"
    ],
    messageTypes: [
      "nwr",
      "rev",
      "ack"
    ],
    writerRoles: [
      "A",
      "AD",
      "AR",
      "C",
      "CA",
      "PA",
      "PRF",
      "SA",
      "SR",
      "TR",
      "WR"
    ],
    publisherRoles: [
      "AM",
      "AQ",
      "E",
      "ES",
      "OP",
      "PA",
      "SE"
    ],
    subPublisherRoles: [
      "AM",
      "PA",
      "SE"
    ],
    agreementRoleCodeCodes: [
      "AC",
      "AS"
    ],
    agreementTypeCodes: [
      "OG",
      "OS",
      "PG",
      "PS"
    ],
    biemCisacMediaTypeCodes: [
      "CD",
      "CD2",
      "CDM",
      "CDS",
      "CE",
      "CE2",
      "CEP",
      "CES",
      "CXM",
      "CXS",
      "DC",
      "DC2",
      "DL",
      "DM",
      "DMC",
      "DS",
      "DV1",
      "DV2",
      "DV3",
      "DV4",
      "DW",
      "EMC",
      "EP",
      "EPM",
      "LP",
      "LP2",
      "LP3",
      "LP4",
      "MC",
      "MC2",
      "MC3",
      "MC4",
      "MCP",
      "MD",
      "MD2",
      "MDP",
      "MDR",
      "MDS",
      "MLP",
      "MMC",
      "RCD",
      "RCE",
      "RDS",
      "RMC",
      "RMS",
      "S",
      "SA",
      "SA2",
      "SCD",
      "SM2",
      "SMC"
    ],
    biemCisacMediaTypeExtendedCodes: [
      "CD",
      "CD2",
      "CDM",
      "CDS",
      "CE",
      "CE2",
      "CEP",
      "CES",
      "CXM",
      "CXS",
      "DC",
      "DC2",
      "DL",
      "DM",
      "DMC",
      "DS",
      "DV1",
      "DV2",
      "DV3",
      "DV4",
      "DW",
      "EMC",
      "EP",
      "EPM",
      "LP",
      "LP2",
      "LP3",
      "LP4",
      "MC",
      "MC2",
      "MC3",
      "MC4",
      "MCP",
      "MD",
      "MD2",
      "MDP",
      "MDR",
      "MDS",
      "MLP",
      "MMC",
      "RCD",
      "RCE",
      "RDS",
      "RMC",
      "RMS",
      "S",
      "SA",
      "SA2",
      "SCD",
      "SM2",
      "SMC"
    ],
    bltvrBackgroundLogoThemeVisualRolledUpCueCodes: [
      "B",
      "L",
      "R",
      "T",
      "V"
    ],
    compositeTypeCodes: [
      "[blank]",
      "COS",
      "MED",
      "POT",
      "UCO"
    ],
    cwrWorkTypeCodes: [
      "AC",
      "AL",
      "AM",
      "AR",
      "BD",
      "BG",
      "BL",
      "CC",
      "CD",
      "CL",
      "CT",
      "DN",
      "FK",
      "FM",
      "JG",
      "JZ",
      "LA",
      "LN",
      "NA",
      "OP",
      "PK",
      "PP",
      "RB",
      "RK",
      "RP",
      "SD",
      "SG",
      "SY",
      "TA"
    ],
    excerptTypeCodes: [
      "[blank]",
      "MOV",
      "UEX"
    ],
    instrumentCodes: [
      "ACC",
      "ACL",
      "AFL",
      "AHN",
      "ALP",
      "ALT",
      "AMP",
      "ARC",
      "ASX",
      "BAG",
      "BAR",
      "BAS",
      "BBF",
      "BBT",
      "BCL",
      "BDN",
      "BDR",
      "BEL",
      "BFT",
      "BGL",
      "BGT",
      "BHN",
      "BKA",
      "BNG",
      "BNJ",
      "BOB",
      "BOY",
      "BQF",
      "BRC",
      "BRT",
      "BSN",
      "BSP",
      "BSS",
      "BSX",
      "BTN",
      "CAL",
      "CAR",
      "CBC",
      "CBN",
      "CCL",
      "CEL",
      "CHM",
      "CIM",
      "CLR",
      "CNB",
      "CNG",
      "CNT",
      "COM",
      "CST",
      "CTN",
      "CVD",
      "CYM",
      "DIJ",
      "DIZ",
      "DJM",
      "DRK",
      "DRM",
      "DUL",
      "EBG",
      "EFC",
      "EGT",
      "EHN",
      "ELL",
      "ELP",
      "EOG",
      "ERH",
      "EUP",
      "FLG",
      "FLT",
      "FRN",
      "GHM",
      "GHP",
      "GLS",
      "GNG",
      "GTR",
      "HAR",
      "HBL",
      "HCK",
      "HPS",
      "HRM",
      "HRN",
      "HRP",
      "HUR",
      "KAZ",
      "KEY",
      "KLV",
      "KOT",
      "LUT",
      "LYR",
      "MAN",
      "MAR",
      "MBR",
      "MCS",
      "MEL",
      "MEZ",
      "MID",
      "MSB",
      "NAF",
      "NAR",
      "NHN",
      "OBD",
      "OBO",
      "OND",
      "ORG",
      "PER",
      "PIA",
      "PIC",
      "PPA",
      "PRO",
      "PRP",
      "PWH",
      "REC",
      "RUA",
      "SAM",
      "SAX",
      "SDM",
      "SEQ",
      "SHK",
      "SHM",
      "SHO",
      "SHW",
      "SIT",
      "SNR",
      "SNS",
      "SOP",
      "SOU",
      "SPO",
      "SRC",
      "SSX",
      "STD",
      "SYN",
      "TAB",
      "TAM",
      "TAP",
      "TBA",
      "TEN",
      "THE",
      "THN",
      "TIM",
      "TMB",
      "TMN",
      "TRC",
      "TRI",
      "TRM",
      "TSX",
      "TTM",
      "TYP",
      "UKE",
      "VCL",
      "VDG",
      "VIB",
      "VID",
      "VLA",
      "VLN",
      "VOC",
      "WBK",
      "WHS",
      "WTB",
      "XYL",
      "YQN",
      "ZHG",
      "ZIT"
    ],
    intendedPurposeCodes: [
      "COM",
      "FIL",
      "GEN",
      "LIB",
      "MUL",
      "RAD",
      "TEL",
      "THR",
      "VID"
    ],
    lyricAdaptationCodes: [
      "ADL",
      "MOD",
      "NEW",
      "NON",
      "ORI",
      "REP",
      "TRA",
      "UNS"
    ],
    musicArrangementCodes: [
      "ADM",
      "ARR",
      "NEW",
      "ORI",
      "UNS"
    ],
    musicalWorkDistributionCategoryCodes: [
      "JAZ",
      "POP",
      "SER",
      "UNC"
    ],
    recordingTechniqueCodes: [
      "A",
      "D",
      "U"
    ],
    specialAgreementIndicatorCodes: [
      "B",
      "L",
      "N",
      "R",
      "U",
      "Y"
    ],
    standardInstrumentationCodes: [
      "AUD",
      "BBA",
      "BCH",
      "BND",
      "BQN",
      "BQU",
      "BRC",
      "BTR",
      "BXT",
      "CAO",
      "CBA",
      "CCH",
      "CEN",
      "CHO",
      "CLC",
      "COR",
      "CQN",
      "DCH",
      "FLC",
      "GML",
      "GQT",
      "HNC",
      "JZE",
      "MCH",
      "MXC",
      "OQU",
      "ORC",
      "PCE",
      "PDU",
      "PFH",
      "PQN",
      "PQU",
      "PTR",
      "SBA",
      "SGT",
      "SOC",
      "SOR",
      "SQN",
      "SQT",
      "SQU",
      "TBC",
      "TCH",
      "TPC",
      "TUC",
      "UCH",
      "WCH",
      "WEN",
      "WQN",
      "WQR",
      "YCH"
    ],
    subjectCodes: [
      "DL",
      "DW",
      "EW",
      "GW",
      "IQ",
      "RQ",
      "SC"
    ],
    textMusicRelationshipCodes: [
      "MTN",
      "MTX",
      "MUS",
      "TXT"
    ],
    transactionStatusCodes: [
      "AC",
      "AS",
      "CO",
      "DI",
      "DU",
      "NP",
      "RA",
      "RC",
      "RJ"
    ],
    transactionTypeCodes: [
      "ACK",
      "AGR",
      "COP",
      "EXC",
      "ISW",
      "NWR",
      "REV"
    ],
    typeOfRightCodes: [
      "MEC",
      "PER",
      "SYN"
    ],
    usaLicenseIndicatorCodes: [
      "A",
      "B",
      "G",
      "M",
      "S"
    ],
    versionTypeCodes: [
      "MOD",
      "ORI"
    ],
    tisNumericCodes: [
      "0004",
      "004",
      "4",
      "0008",
      "008",
      "8",
      "0012",
      "012",
      "12",
      "0020",
      "020",
      "20",
      "0024",
      "024",
      "24",
      "0028",
      "028",
      "28",
      "0031",
      "031",
      "31",
      "0032",
      "032",
      "32",
      "0036",
      "036",
      "36",
      "0040",
      "040",
      "40",
      "0044",
      "044",
      "44",
      "0048",
      "048",
      "48",
      "0050",
      "050",
      "50",
      "0051",
      "051",
      "51",
      "0052",
      "052",
      "52",
      "0056",
      "056",
      "56",
      "0064",
      "064",
      "64",
      "0068",
      "068",
      "68",
      "0070",
      "070",
      "70",
      "0072",
      "072",
      "72",
      "0076",
      "076",
      "76",
      "0084",
      "084",
      "84",
      "0090",
      "090",
      "90",
      "0096",
      "096",
      "96",
      "0100",
      "100",
      "0104",
      "104",
      "0108",
      "108",
      "0112",
      "112",
      "0116",
      "116",
      "0120",
      "120",
      "0124",
      "124",
      "0132",
      "132",
      "0140",
      "140",
      "0144",
      "144",
      "0148",
      "148",
      "0152",
      "152",
      "0156",
      "156",
      "0158",
      "158",
      "0170",
      "170",
      "0174",
      "174",
      "0178",
      "178",
      "0180",
      "180",
      "0188",
      "188",
      "0191",
      "191",
      "0192",
      "192",
      "0196",
      "196",
      "0203",
      "203",
      "0204",
      "204",
      "0208",
      "208",
      "0212",
      "212",
      "0214",
      "214",
      "0218",
      "218",
      "0222",
      "222",
      "0226",
      "226",
      "0231",
      "231",
      "0232",
      "232",
      "0233",
      "233",
      "0242",
      "242",
      "0246",
      "246",
      "0250",
      "250",
      "0258",
      "258",
      "0262",
      "262",
      "0266",
      "266",
      "0268",
      "268",
      "0270",
      "270",
      "0276",
      "276",
      "0288",
      "288",
      "0296",
      "296",
      "0300",
      "300",
      "0308",
      "308",
      "0320",
      "320",
      "0324",
      "324",
      "0328",
      "328",
      "0332",
      "332",
      "0336",
      "336",
      "0340",
      "340",
      "0344",
      "344",
      "0348",
      "348",
      "0352",
      "352",
      "0356",
      "356",
      "0360",
      "360",
      "0364",
      "364",
      "0368",
      "368",
      "0372",
      "372",
      "0376",
      "376",
      "0380",
      "380",
      "0384",
      "384",
      "0388",
      "388",
      "0392",
      "392",
      "0398",
      "398",
      "0400",
      "400",
      "0404",
      "404",
      "0408",
      "408",
      "0410",
      "410",
      "0414",
      "414",
      "0417",
      "417",
      "0418",
      "418",
      "0422",
      "422",
      "0426",
      "426",
      "0428",
      "428",
      "0430",
      "430",
      "0434",
      "434",
      "0438",
      "438",
      "0440",
      "440",
      "0442",
      "442",
      "0446",
      "446",
      "0450",
      "450",
      "0454",
      "454",
      "0458",
      "458",
      "0462",
      "462",
      "0466",
      "466",
      "0470",
      "470",
      "0478",
      "478",
      "0480",
      "480",
      "0484",
      "484",
      "0492",
      "492",
      "0496",
      "496",
      "0498",
      "498",
      "0499",
      "499",
      "0504",
      "504",
      "0508",
      "508",
      "0512",
      "512",
      "0516",
      "516",
      "0520",
      "520",
      "0524",
      "524",
      "0528",
      "528",
      "0540",
      "540",
      "0548",
      "548",
      "0554",
      "554",
      "0558",
      "558",
      "0562",
      "562",
      "0566",
      "566",
      "0578",
      "578",
      "0583",
      "583",
      "0584",
      "584",
      "0585",
      "585",
      "0586",
      "586",
      "0591",
      "591",
      "0598",
      "598",
      "0600",
      "600",
      "0604",
      "604",
      "0608",
      "608",
      "0616",
      "616",
      "0620",
      "620",
      "0624",
      "624",
      "0626",
      "626",
      "0630",
      "630",
      "0634",
      "634",
      "0642",
      "642",
      "0643",
      "643",
      "0646",
      "646",
      "0659",
      "659",
      "0662",
      "662",
      "0670",
      "670",
      "0674",
      "674",
      "0678",
      "678",
      "0682",
      "682",
      "0686",
      "686",
      "0688",
      "688",
      "0690",
      "690",
      "0694",
      "694",
      "0702",
      "702",
      "0703",
      "703",
      "0704",
      "704",
      "0705",
      "705",
      "0706",
      "706",
      "0710",
      "710",
      "0716",
      "716",
      "0724",
      "724",
      "0728",
      "728",
      "0729",
      "729",
      "0732",
      "732",
      "0740",
      "740",
      "0748",
      "748",
      "0752",
      "752",
      "0756",
      "756",
      "0760",
      "760",
      "0762",
      "762",
      "0764",
      "764",
      "0768",
      "768",
      "0776",
      "776",
      "0780",
      "780",
      "0784",
      "784",
      "0788",
      "788",
      "0792",
      "792",
      "0795",
      "795",
      "0798",
      "798",
      "0800",
      "800",
      "0804",
      "804",
      "0807",
      "807",
      "0818",
      "818",
      "0826",
      "826",
      "0834",
      "834",
      "0840",
      "840",
      "0854",
      "854",
      "0858",
      "858",
      "0860",
      "860",
      "0862",
      "862",
      "0882",
      "882",
      "0887",
      "887",
      "0894",
      "894",
      "2100",
      "2101",
      "2102",
      "2103",
      "2104",
      "2105",
      "2106",
      "2107",
      "2108",
      "2109",
      "2110",
      "2111",
      "2112",
      "2113",
      "2114",
      "2115",
      "2116",
      "2117",
      "2118",
      "2119",
      "2120",
      "2121",
      "2122",
      "2123",
      "2124",
      "2125",
      "2126",
      "2127",
      "2128",
      "2129",
      "2130",
      "2131",
      "2132",
      "2133",
      "2134",
      "2136"
    ]
  }
};

// src/cwr-sdk/lookups/societyCodeVariants.ts
function presentSocietyCode(code) {
  const trimmed = (code || "").trim();
  if (!trimmed || trimmed === "000") return void 0;
  return trimmed;
}
__name(presentSocietyCode, "presentSocietyCode");

// src/cwr-sdk/lookups/index.ts
var sets = cwr_lookup_data_types_v1_0_default.sets;
var tisSet = new Set(sets.tisNumericCodes);
var roleSet = new Set(sets.roleCodes);
var publisherRoleSet = new Set(sets.publisherRoles);
var subPublisherRoleSet = new Set(sets.subPublisherRoles);
var writerRoleSet = new Set(sets.writerRoles);
var societySet = new Set(sets.societyCodes);
function hasTisCode(code) {
  const trimmed = code.trim();
  if (tisSet.has(trimmed)) return true;
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return tisSet.has(String(n)) || tisSet.has(String(n).padStart(3, "0")) || tisSet.has(String(n).padStart(4, "0"));
  }
  return false;
}
__name(hasTisCode, "hasTisCode");
function isPublisherRole(role) {
  return publisherRoleSet.has(role);
}
__name(isPublisherRole, "isPublisherRole");
function isSubPublisherRole(role) {
  return subPublisherRoleSet.has(role);
}
__name(isSubPublisherRole, "isSubPublisherRole");

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

// src/validation/normalizeIswc.ts
function formatIswcForValidation(value) {
  const compact = value.trim().toUpperCase().replace(/[.\s-]/g, "");
  const match = compact.match(/^T(\d{9})(\d)$/);
  if (!match) return null;
  const digits = match[1];
  return `T-${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${match[2]}`;
}
__name(formatIswcForValidation, "formatIswcForValidation");

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
  const society = presentSocietyCode(defaultSociety);
  const pushShare = /* @__PURE__ */ __name((rightsType, val) => {
    if (val !== void 0 && !Number.isNaN(val)) {
      shares.push(society ? { rightsType, value: val, society } : { rightsType, value: val });
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
function mapXrfToIdentifier(obj) {
  const org = (obj.OrganisationCode || "").trim();
  const id = (obj.Identifier || "").trim();
  if (!id) return null;
  if (org === "000" || org === "099") return null;
  if (org === "ISW") {
    return { kind: "iswc", value: formatIswcForValidation(id) || id };
  }
  if (org === "ISR") return { kind: "isrc", value: id };
  if (/^\d+$/.test(org)) {
    return {
      kind: "identifier",
      identifier: {
        type: "societyWorkId",
        value: id,
        source: { type: "cisacSociety", value: org }
      }
    };
  }
  if (/^[A-Za-z]{2,3}$/.test(org)) {
    return {
      kind: "identifier",
      identifier: {
        type: "publisherWorkId",
        value: id,
        source: { type: "cwrSubmitter", value: org.toUpperCase() }
      }
    };
  }
  return { kind: "identifier", identifier: { type: "proprietary", value: id } };
}
__name(mapXrfToIdentifier, "mapXrfToIdentifier");
function pushIdentifier(identifiers, entry) {
  const exists = identifiers.some(
    (i) => i.type === entry.type && i.value === entry.value && i.source?.type === entry.source?.type && i.source?.value === entry.source?.value
  );
  if (!exists) identifiers.push(entry);
}
__name(pushIdentifier, "pushIdentifier");
function pushUnique(values, value) {
  if (!values.includes(value)) values.push(value);
}
__name(pushUnique, "pushUnique");

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
    iswc: [],
    isrc: [],
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
      const partyId = (obj.InterestedPartyNumber || "").trim();
      const normalizedId = normalizePartyKey(partyId);
      const existing = currentPublisherChain.party.representedBy.find(
        (sub2) => sub2.partyId === partyId || normalizePartyKey(sub2.partyId) === normalizedId
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
    if (type === "ACK") {
      model.messages.type = "ack";
      model.messages.creationDate = (obj.CreationDate || "").trim();
      model.messages.creationTime = (obj.CreationTime || "").trim();
      model.messages.originalGroupId = (obj.OriginalGroupId || "").trim();
      model.messages.originalTransactionSequence = (obj.OriginalTransactionSeq || "").trim();
      model.messages.originalTransactionType = (obj.OriginalTransactionType || "").trim();
      model.messages.creationTitle = (obj.CreationTitle || "").trim();
      model.messages.submitterCreationNumber = (obj.SubmitterCreationNumber || "").trim();
      model.messages.recipientCreationNumber = (obj.RecipientCreationNumber || "").trim();
      model.messages.processingDate = (obj.ProcessingDate || "").trim();
      model.messages.transactionStatus = (obj.TransactionStatus || "").trim();
      continue;
    }
    if (type === "MSG") {
      const msgs = model.messages.msgs || [];
      msgs.push({
        status: (obj.MessageType || "").trim(),
        message: (obj.MessageText || "").trim(),
        originalRecordSequence: (obj.OriginalRecordSequence || "").trim(),
        recordType: (obj.MessageRecordType || "").trim(),
        messageLevel: (obj.MessageLevel || "").trim(),
        validationNumber: (obj.ValidationNumber || "").trim()
      });
      model.messages.msgs = msgs;
      continue;
    }
    if (type === "REC") {
      const isrc = (obj.ISRC || "").trim();
      const trackTitle = obj.RecordingTitle || "";
      const trackVersion = obj.VersionTitle || "";
      const releaseTitle = obj.AlbumTitle || "";
      const ean = obj.EAN || obj.Ean || obj.EanCode || obj.EanNumber || void 0;
      const catalogNumber = obj.ReleaseCatalogNumber || void 0;
      const release = {
        title: releaseTitle || void 0,
        catno: catalogNumber || void 0,
        label: obj.RecordLabel || void 0,
        releaseDate: obj.ReleaseDate || void 0
      };
      let track = isrc ? model.recordings.find((r) => Array.isArray(r.isrc) && r.isrc.includes(isrc)) : null;
      if (!track) {
        track = {
          version: trackVersion || void 0,
          title: trackTitle || void 0,
          isrc: isrc ? [isrc] : void 0,
          releases: []
        };
        model.recordings.push(track);
      } else if (isrc && !track.isrc.includes(isrc)) {
        track.isrc.push(isrc);
      }
      if (ean) release.ean = [ean];
      if (release.title || ean || catalogNumber || release.label || release.releaseDate) {
        track.releases = track.releases || [];
        track.releases.push(release);
      }
      continue;
    }
    if (type === "NWR" || type === "REV") {
      if (model.messages.type !== "ack") {
        model.messages.type = type.toLowerCase();
      }
      const mainTitle = (obj.Title || obj.WorkTitle || "").trim();
      if (mainTitle.length) model.titles.push({ value: mainTitle, type: "TT" });
      if (obj.ISWC) {
        pushUnique(model.iswc, formatIswcForValidation(obj.ISWC) || obj.ISWC.trim());
      }
      if (obj.SubmitterWorkNumber) {
        const senderId = model.header.senderIdentifier;
        pushIdentifier(model.identifiers, {
          type: "submitterWorkId",
          value: obj.SubmitterWorkNumber,
          ...senderId ? {
            source: {
              type: "cwrSubmitter",
              value: senderId,
              ...model.header.senderName ? { name: model.header.senderName } : {}
            }
          } : {}
        });
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
      continue;
    }
    if (type === "XRF") {
      const mapped = mapXrfToIdentifier(obj);
      if (!mapped) continue;
      if (mapped.kind === "iswc") pushUnique(model.iswc, mapped.value);
      else if (mapped.kind === "isrc") {
        const onRecording = model.recordings.some(
          (r) => Array.isArray(r.isrc) && r.isrc.includes(mapped.value)
        );
        if (!onRecording) pushUnique(model.isrc, mapped.value);
      } else pushIdentifier(model.identifiers, mapped.identifier);
      continue;
    }
  }
  absorbWorkIsrcs(model);
  dedupeTitles(model);
  return model;
}
__name(buildWorkModel, "buildWorkModel");
function absorbWorkIsrcs(model) {
  if (!model.isrc.length) return;
  const onRecordings = /* @__PURE__ */ new Set();
  for (const recording of model.recordings) {
    for (const code of recording.isrc || []) onRecordings.add(code);
  }
  model.isrc = model.isrc.filter((code) => !onRecordings.has(code));
}
__name(absorbWorkIsrcs, "absorbWorkIsrcs");
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
    delete p._activeCollTerritory;
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
        iswc: model.iswc.length ? model.iswc : void 0,
        isrc: model.isrc.length ? model.isrc : void 0,
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
  version: "1.0.1",
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
            iswc: { type: "array", items: { type: "string" } },
            isrc: { type: "array", items: { type: "string" } },
            identifiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  value: { type: "string" },
                  source: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      value: { type: "string" },
                      name: { type: "string" }
                    },
                    required: ["type", "value"]
                  }
                },
                required: ["type", "value"]
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
        iswc: work.iswc,
        isrc: work.isrc,
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
  const ignore = /* @__PURE__ */ new Set(["HDR", "GRH", "GRT", "TRL", "MSG"]);
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
  let ackHeader = false;
  const assignedSlots = new Array(lines.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    const type = getRecordType(lines[i]);
    if (ignore.has(type)) continue;
    if (type === "ACK") {
      if (sawWorkStart) {
        problems.push(`Unexpected ACK at line ${i + 1}`);
      }
      sawWorkStart = true;
      ackHeader = true;
      currentSlotIdx = 0;
      continue;
    }
    if (["NWR", "REV", "ISW", "EXC"].includes(type)) {
      if (sawWorkStart && !ackHeader) {
        problems.push(`Unexpected ${type} at line ${i + 1}; work blocks must start with a single NWR/REV/ISW/EXC.`);
      }
      sawWorkStart = true;
      ackHeader = false;
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
  if (transactionType === "REV") return "REV";
  if (transactionType === "ACK") return "ACK";
  return "NWR";
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
        },
        iswc: {
          type: "array",
          items: {
            type: "string",
            pattern: "^(?:T-\\d{3}\\.\\d{3}\\.\\d{3}-\\d|T\\d{10}|T-\\d{9}-\\d)$"
          }
        },
        isrc: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]{2}[A-Z0-9]{3}\\d{7}$"
          }
        }
      },
      type: "object"
    },
    Flags: {
      additionalProperties: {},
      properties: {
        aiUsage: {
          $ref: "#/definitions/AiUsageIndicator"
        },
        anomalous: {
          type: "boolean"
        },
        fraudulent: {
          type: "boolean"
        },
        anomalousReason: {
          $ref: "#/definitions/AnomalousWorkReasonCode"
        }
      },
      type: "object"
    },
    HdrRecord: {
      additionalProperties: false,
      properties: {
        characterSet: {
          $ref: "#/definitions/CharacterSetCode"
        },
        creationDate: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        creationTime: {
          type: "string",
          pattern: "^\\d{6}$"
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
          type: "string",
          pattern: "^\\d{8}$"
        },
        version: {
          type: "string"
        },
        conventions: {
          $ref: "#/definitions/Conventions"
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
              },
              originalRecordSequence: {
                type: "string"
              },
              recordType: {
                type: "string"
              },
              messageLevel: {
                type: "string"
              },
              validationNumber: {
                type: "string"
              }
            },
            type: "object"
          },
          type: "array"
        },
        creationDate: {
          type: "string"
        },
        creationTime: {
          type: "string"
        },
        originalGroupId: {
          type: "string"
        },
        originalTransactionSequence: {
          type: "string"
        },
        originalTransactionType: {
          type: "string"
        },
        creationTitle: {
          type: "string"
        },
        submitterCreationNumber: {
          type: "string"
        },
        recipientCreationNumber: {
          type: "string"
        },
        processingDate: {
          type: "string"
        },
        transactionStatus: {
          type: "string"
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
              $ref: "#/definitions/RevocationReasonCode"
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
          $ref: "#/definitions/MessageType"
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
          $ref: "#/definitions/ControlledFlag"
        },
        ipi: {
          type: "string",
          pattern: "^\\d{11}$"
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
          type: "number",
          minimum: 0,
          maximum: 100
        },
        roleSplitT: {
          type: "number",
          minimum: 0,
          maximum: 100
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
              type: "array",
              items: {
                $ref: "#/definitions/TisNumericCode"
              }
            },
            include: {
              type: "array",
              items: {
                $ref: "#/definitions/TisNumericCode"
              }
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
      type: "object",
      allOf: [
        {
          if: {
            properties: {
              shareTypes: {
                type: "array",
                contains: {
                  type: "object",
                  properties: {
                    type: {
                      const: "own"
                    }
                  },
                  required: [
                    "type"
                  ]
                }
              }
            }
          },
          then: {
            properties: {
              territory: {
                properties: {
                  include: {
                    maxItems: 0
                  },
                  exclude: {
                    maxItems: 0
                  }
                }
              },
              shareTypes: {
                maxItems: 1
              }
            }
          }
        }
      ]
    },
    Recording: {
      additionalProperties: false,
      properties: {
        isrc: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]{2}[A-Z0-9]{3}\\d{7}$"
          }
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
        },
        identifiers: {
          type: "array",
          items: {
            $ref: "#/definitions/WorkIdentifier"
          }
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/definitions/Tag"
          }
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
          type: "array",
          items: {
            type: "string",
            pattern: "^\\d{13}$"
          }
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
          type: "string",
          pattern: "^\\d{8}$"
        },
        title: {
          type: "string"
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/definitions/Tag"
          }
        }
      },
      type: "object"
    },
    Relinquishment: {
      additionalProperties: false,
      properties: {
        effectiveFrom: {
          type: "string",
          pattern: "^\\d{8}$"
        },
        note: {
          type: "string"
        },
        postTermCollectionUntil: {
          type: "string",
          pattern: "^\\d{8}$"
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
                  type: "array",
                  items: {
                    $ref: "#/definitions/TisNumericCode"
                  }
                },
                include: {
                  type: "array",
                  items: {
                    $ref: "#/definitions/TisNumericCode"
                  }
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
      type: "string",
      enum: [
        "pr",
        "mr",
        "sr"
      ]
    },
    RoleCode: {
      type: "string",
      enum: [
        "A",
        "AD",
        "AM",
        "AQ",
        "AR",
        "C",
        "CA",
        "E",
        "ES",
        "OP",
        "PA",
        "PRF",
        "SA",
        "SE",
        "SR",
        "TR",
        "WR"
      ]
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
        },
        iswc: {
          type: "array",
          items: {
            type: "string",
            pattern: "^(?:T-\\d{3}\\.\\d{3}\\.\\d{3}-\\d|T\\d{10}|T-\\d{9}-\\d)$"
          }
        },
        isrc: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[A-Z]{2}[A-Z0-9]{3}\\d{7}$"
          }
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
          $ref: "#/definitions/SocietyCode"
        },
        value: {
          type: "number",
          minimum: 0,
          maximum: 100
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
      type: "object",
      required: [
        "type",
        "value"
      ],
      properties: {
        type: {
          type: "string",
          enum: [
            "publisherWorkId",
            "societyWorkId",
            "submitterWorkId",
            "assetId",
            "proprietary"
          ]
        },
        value: {
          type: "string"
        },
        source: {
          $ref: "#/definitions/IdentifierNamespace"
        }
      }
    },
    WorkTitle: {
      additionalProperties: false,
      properties: {
        language: {
          $ref: "#/definitions/LanguageCode"
        },
        type: {
          $ref: "#/definitions/TitleTypeCode"
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
    TisNumericCode: {
      type: "string",
      enum: [
        "0004",
        "004",
        "4",
        "0008",
        "008",
        "8",
        "0012",
        "012",
        "12",
        "0020",
        "020",
        "20",
        "0024",
        "024",
        "24",
        "0028",
        "028",
        "28",
        "0031",
        "031",
        "31",
        "0032",
        "032",
        "32",
        "0036",
        "036",
        "36",
        "0040",
        "040",
        "40",
        "0044",
        "044",
        "44",
        "0048",
        "048",
        "48",
        "0050",
        "050",
        "50",
        "0051",
        "051",
        "51",
        "0052",
        "052",
        "52",
        "0056",
        "056",
        "56",
        "0064",
        "064",
        "64",
        "0068",
        "068",
        "68",
        "0070",
        "070",
        "70",
        "0072",
        "072",
        "72",
        "0076",
        "076",
        "76",
        "0084",
        "084",
        "84",
        "0090",
        "090",
        "90",
        "0096",
        "096",
        "96",
        "0100",
        "100",
        "0104",
        "104",
        "0108",
        "108",
        "0112",
        "112",
        "0116",
        "116",
        "0120",
        "120",
        "0124",
        "124",
        "0132",
        "132",
        "0140",
        "140",
        "0144",
        "144",
        "0148",
        "148",
        "0152",
        "152",
        "0156",
        "156",
        "0158",
        "158",
        "0170",
        "170",
        "0174",
        "174",
        "0178",
        "178",
        "0180",
        "180",
        "0188",
        "188",
        "0191",
        "191",
        "0192",
        "192",
        "0196",
        "196",
        "0203",
        "203",
        "0204",
        "204",
        "0208",
        "208",
        "0212",
        "212",
        "0214",
        "214",
        "0218",
        "218",
        "0222",
        "222",
        "0226",
        "226",
        "0231",
        "231",
        "0232",
        "232",
        "0233",
        "233",
        "0242",
        "242",
        "0246",
        "246",
        "0250",
        "250",
        "0258",
        "258",
        "0262",
        "262",
        "0266",
        "266",
        "0268",
        "268",
        "0270",
        "270",
        "0276",
        "276",
        "0288",
        "288",
        "0296",
        "296",
        "0300",
        "300",
        "0308",
        "308",
        "0320",
        "320",
        "0324",
        "324",
        "0328",
        "328",
        "0332",
        "332",
        "0336",
        "336",
        "0340",
        "340",
        "0344",
        "344",
        "0348",
        "348",
        "0352",
        "352",
        "0356",
        "356",
        "0360",
        "360",
        "0364",
        "364",
        "0368",
        "368",
        "0372",
        "372",
        "0376",
        "376",
        "0380",
        "380",
        "0384",
        "384",
        "0388",
        "388",
        "0392",
        "392",
        "0398",
        "398",
        "0400",
        "400",
        "0404",
        "404",
        "0408",
        "408",
        "0410",
        "410",
        "0414",
        "414",
        "0417",
        "417",
        "0418",
        "418",
        "0422",
        "422",
        "0426",
        "426",
        "0428",
        "428",
        "0430",
        "430",
        "0434",
        "434",
        "0438",
        "438",
        "0440",
        "440",
        "0442",
        "442",
        "0446",
        "446",
        "0450",
        "450",
        "0454",
        "454",
        "0458",
        "458",
        "0462",
        "462",
        "0466",
        "466",
        "0470",
        "470",
        "0478",
        "478",
        "0480",
        "480",
        "0484",
        "484",
        "0492",
        "492",
        "0496",
        "496",
        "0498",
        "498",
        "0499",
        "499",
        "0504",
        "504",
        "0508",
        "508",
        "0512",
        "512",
        "0516",
        "516",
        "0520",
        "520",
        "0524",
        "524",
        "0528",
        "528",
        "0540",
        "540",
        "0548",
        "548",
        "0554",
        "554",
        "0558",
        "558",
        "0562",
        "562",
        "0566",
        "566",
        "0578",
        "578",
        "0583",
        "583",
        "0584",
        "584",
        "0585",
        "585",
        "0586",
        "586",
        "0591",
        "591",
        "0598",
        "598",
        "0600",
        "600",
        "0604",
        "604",
        "0608",
        "608",
        "0616",
        "616",
        "0620",
        "620",
        "0624",
        "624",
        "0626",
        "626",
        "0630",
        "630",
        "0634",
        "634",
        "0642",
        "642",
        "0643",
        "643",
        "0646",
        "646",
        "0659",
        "659",
        "0662",
        "662",
        "0670",
        "670",
        "0674",
        "674",
        "0678",
        "678",
        "0682",
        "682",
        "0686",
        "686",
        "0688",
        "688",
        "0690",
        "690",
        "0694",
        "694",
        "0702",
        "702",
        "0703",
        "703",
        "0704",
        "704",
        "0705",
        "705",
        "0706",
        "706",
        "0710",
        "710",
        "0716",
        "716",
        "0724",
        "724",
        "0728",
        "728",
        "0729",
        "729",
        "0732",
        "732",
        "0740",
        "740",
        "0748",
        "748",
        "0752",
        "752",
        "0756",
        "756",
        "0760",
        "760",
        "0762",
        "762",
        "0764",
        "764",
        "0768",
        "768",
        "0776",
        "776",
        "0780",
        "780",
        "0784",
        "784",
        "0788",
        "788",
        "0792",
        "792",
        "0795",
        "795",
        "0798",
        "798",
        "0800",
        "800",
        "0804",
        "804",
        "0807",
        "807",
        "0818",
        "818",
        "0826",
        "826",
        "0834",
        "834",
        "0840",
        "840",
        "0854",
        "854",
        "0858",
        "858",
        "0860",
        "860",
        "0862",
        "862",
        "0882",
        "882",
        "0887",
        "887",
        "0894",
        "894",
        "2100",
        "2101",
        "2102",
        "2103",
        "2104",
        "2105",
        "2106",
        "2107",
        "2108",
        "2109",
        "2110",
        "2111",
        "2112",
        "2113",
        "2114",
        "2115",
        "2116",
        "2117",
        "2118",
        "2119",
        "2120",
        "2121",
        "2122",
        "2123",
        "2124",
        "2125",
        "2126",
        "2127",
        "2128",
        "2129",
        "2130",
        "2131",
        "2132",
        "2133",
        "2134",
        "2136"
      ]
    },
    ControlledFlag: {
      type: "string",
      enum: [
        "yes",
        "no"
      ]
    },
    TitleTypeCode: {
      type: "string",
      enum: [
        "AL",
        "ALT",
        "AT",
        "ET",
        "FT",
        "IT",
        "NAT",
        "OL",
        "OT",
        "PT",
        "RT",
        "TE",
        "TT",
        "UT"
      ]
    },
    IdentifierSource: {
      type: "string",
      enum: [
        "001",
        "002",
        "003",
        "004",
        "005",
        "006",
        "007",
        "008",
        "009",
        "010",
        "011",
        "012",
        "013",
        "014",
        "015",
        "016",
        "017",
        "018",
        "019",
        "020",
        "021",
        "022",
        "023",
        "024",
        "025",
        "026",
        "027",
        "028",
        "029",
        "030",
        "031",
        "032",
        "033",
        "034",
        "035",
        "036",
        "037",
        "038",
        "039",
        "040",
        "041",
        "042",
        "043",
        "044",
        "045",
        "046",
        "047",
        "048",
        "049",
        "050",
        "051",
        "052",
        "053",
        "054",
        "055",
        "056",
        "057",
        "058",
        "059",
        "060",
        "061",
        "062",
        "063",
        "064",
        "065",
        "066",
        "067",
        "068",
        "069",
        "070",
        "071",
        "072",
        "073",
        "074",
        "075",
        "076",
        "077",
        "078",
        "079",
        "080",
        "081",
        "082",
        "083",
        "084",
        "085",
        "086",
        "087",
        "088",
        "089",
        "090",
        "091",
        "092",
        "093",
        "094",
        "095",
        "096",
        "097",
        "098",
        "099",
        "1",
        "10",
        "101",
        "102",
        "103",
        "104",
        "105",
        "106",
        "107",
        "108",
        "109",
        "11",
        "110",
        "111",
        "112",
        "113",
        "114",
        "115",
        "116",
        "117",
        "118",
        "119",
        "12",
        "120",
        "121",
        "122",
        "123",
        "124",
        "125",
        "126",
        "127",
        "128",
        "129",
        "13",
        "130",
        "131",
        "132",
        "133",
        "134",
        "135",
        "136",
        "137",
        "138",
        "139",
        "14",
        "140",
        "141",
        "142",
        "143",
        "144",
        "145",
        "146",
        "147",
        "148",
        "149",
        "15",
        "150",
        "151",
        "152",
        "153",
        "154",
        "155",
        "156",
        "157",
        "158",
        "159",
        "16",
        "160",
        "161",
        "162",
        "163",
        "164",
        "166",
        "167",
        "168",
        "169",
        "17",
        "170",
        "171",
        "172",
        "173",
        "174",
        "175",
        "176",
        "177",
        "178",
        "179",
        "18",
        "180",
        "181",
        "182",
        "183",
        "184",
        "185",
        "186",
        "187",
        "188",
        "189",
        "19",
        "190",
        "191",
        "192",
        "193",
        "194",
        "195",
        "196",
        "197",
        "198",
        "199",
        "2",
        "20",
        "200",
        "201",
        "202",
        "203",
        "204",
        "205",
        "206",
        "207",
        "208",
        "209",
        "21",
        "210",
        "212",
        "213",
        "214",
        "215",
        "216",
        "217",
        "218",
        "219",
        "22",
        "220",
        "221",
        "222",
        "223",
        "224",
        "225",
        "226",
        "227",
        "228",
        "229",
        "23",
        "230",
        "231",
        "232",
        "233",
        "234",
        "235",
        "236",
        "237",
        "238",
        "239",
        "24",
        "240",
        "241",
        "242",
        "243",
        "244",
        "245",
        "246",
        "247",
        "248",
        "249",
        "25",
        "250",
        "251",
        "252",
        "253",
        "254",
        "255",
        "256",
        "257",
        "258",
        "259",
        "26",
        "260",
        "261",
        "262",
        "263",
        "264",
        "265",
        "266",
        "267",
        "268",
        "269",
        "27",
        "270",
        "271",
        "272",
        "273",
        "274",
        "275",
        "276",
        "277",
        "278",
        "279",
        "28",
        "280",
        "282",
        "283",
        "284",
        "285",
        "286",
        "287",
        "288",
        "289",
        "29",
        "290",
        "291",
        "292",
        "293",
        "294",
        "295",
        "296",
        "297",
        "298",
        "299",
        "3",
        "30",
        "300",
        "301",
        "302",
        "303",
        "304",
        "305",
        "306",
        "307",
        "308",
        "309",
        "31",
        "310",
        "311",
        "312",
        "313",
        "314",
        "315",
        "316",
        "317",
        "318",
        "319",
        "32",
        "320",
        "321",
        "322",
        "323",
        "324",
        "325",
        "326",
        "327",
        "328",
        "329",
        "33",
        "330",
        "331",
        "332",
        "333",
        "334",
        "335",
        "336",
        "337",
        "338",
        "339",
        "34",
        "340",
        "341",
        "342",
        "343",
        "344",
        "345",
        "346",
        "347",
        "348",
        "349",
        "35",
        "350",
        "351",
        "352",
        "353",
        "354",
        "355",
        "356",
        "357",
        "358",
        "359",
        "36",
        "360",
        "361",
        "362",
        "363",
        "37",
        "38",
        "39",
        "4",
        "40",
        "41",
        "42",
        "43",
        "44",
        "45",
        "46",
        "47",
        "48",
        "49",
        "5",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "555",
        "56",
        "57",
        "58",
        "59",
        "590",
        "591",
        "592",
        "6",
        "60",
        "61",
        "62",
        "63",
        "635",
        "64",
        "65",
        "658",
        "66",
        "67",
        "672",
        "68",
        "69",
        "7",
        "70",
        "700",
        "701",
        "702",
        "703",
        "704",
        "705",
        "707",
        "708",
        "71",
        "710",
        "72",
        "73",
        "74",
        "75",
        "758",
        "76",
        "77",
        "775",
        "776",
        "777",
        "778",
        "779",
        "78",
        "780",
        "781",
        "782",
        "783",
        "784",
        "785",
        "786",
        "787",
        "788",
        "789",
        "79",
        "790",
        "791",
        "792",
        "793",
        "8",
        "80",
        "81",
        "82",
        "83",
        "84",
        "85",
        "86",
        "87",
        "88",
        "888",
        "89",
        "9",
        "90",
        "91",
        "92",
        "93",
        "94",
        "95",
        "96",
        "97",
        "98",
        "99",
        "catalogNumber",
        "ean",
        "isrc",
        "iswc",
        "proprietary",
        "submitterWorkNumber"
      ]
    },
    MessageType: {
      type: "string",
      enum: [
        "nwr",
        "rev",
        "ack"
      ]
    },
    AiUsageIndicator: {
      type: "string",
      enum: [
        "A",
        "B",
        "M",
        "N",
        "T",
        "U",
        "Y"
      ]
    },
    CharacterSetCode: {
      type: "string",
      enum: [
        "ISO-8859-1",
        "ISO-8859-10",
        "ISO-8859-2",
        "ISO-8859-3",
        "ISO-8859-4",
        "ISO-8859-5",
        "ISO-8859-6",
        "ISO-8859-7",
        "ISO-8859-8",
        "ISO-8859-9"
      ]
    },
    SocietyCode: {
      type: "string",
      enum: [
        "001",
        "002",
        "003",
        "004",
        "005",
        "006",
        "007",
        "008",
        "009",
        "010",
        "011",
        "012",
        "013",
        "014",
        "015",
        "016",
        "017",
        "018",
        "019",
        "020",
        "021",
        "022",
        "023",
        "024",
        "025",
        "026",
        "027",
        "028",
        "029",
        "030",
        "031",
        "032",
        "033",
        "034",
        "035",
        "036",
        "037",
        "038",
        "039",
        "040",
        "041",
        "042",
        "043",
        "044",
        "045",
        "046",
        "047",
        "048",
        "049",
        "050",
        "051",
        "052",
        "053",
        "054",
        "055",
        "056",
        "057",
        "058",
        "059",
        "060",
        "061",
        "062",
        "063",
        "064",
        "065",
        "066",
        "067",
        "068",
        "069",
        "070",
        "071",
        "072",
        "073",
        "074",
        "075",
        "076",
        "077",
        "078",
        "079",
        "080",
        "081",
        "082",
        "083",
        "084",
        "085",
        "086",
        "087",
        "088",
        "089",
        "090",
        "091",
        "092",
        "093",
        "094",
        "095",
        "096",
        "097",
        "098",
        "099",
        "1",
        "10",
        "101",
        "102",
        "103",
        "104",
        "105",
        "106",
        "107",
        "108",
        "109",
        "11",
        "110",
        "111",
        "112",
        "113",
        "114",
        "115",
        "116",
        "117",
        "118",
        "119",
        "12",
        "120",
        "121",
        "122",
        "123",
        "124",
        "125",
        "126",
        "127",
        "128",
        "129",
        "13",
        "130",
        "131",
        "132",
        "133",
        "134",
        "135",
        "136",
        "137",
        "138",
        "139",
        "14",
        "140",
        "141",
        "142",
        "143",
        "144",
        "145",
        "146",
        "147",
        "148",
        "149",
        "15",
        "150",
        "151",
        "152",
        "153",
        "154",
        "155",
        "156",
        "157",
        "158",
        "159",
        "16",
        "160",
        "161",
        "162",
        "163",
        "164",
        "166",
        "167",
        "168",
        "169",
        "17",
        "170",
        "171",
        "172",
        "173",
        "174",
        "175",
        "176",
        "177",
        "178",
        "179",
        "18",
        "180",
        "181",
        "182",
        "183",
        "184",
        "185",
        "186",
        "187",
        "188",
        "189",
        "19",
        "190",
        "191",
        "192",
        "193",
        "194",
        "195",
        "196",
        "197",
        "198",
        "199",
        "2",
        "20",
        "200",
        "201",
        "202",
        "203",
        "204",
        "205",
        "206",
        "207",
        "208",
        "209",
        "21",
        "210",
        "212",
        "213",
        "214",
        "215",
        "216",
        "217",
        "218",
        "219",
        "22",
        "220",
        "221",
        "222",
        "223",
        "224",
        "225",
        "226",
        "227",
        "228",
        "229",
        "23",
        "230",
        "231",
        "232",
        "233",
        "234",
        "235",
        "236",
        "237",
        "238",
        "239",
        "24",
        "240",
        "241",
        "242",
        "243",
        "244",
        "245",
        "246",
        "247",
        "248",
        "249",
        "25",
        "250",
        "251",
        "252",
        "253",
        "254",
        "255",
        "256",
        "257",
        "258",
        "259",
        "26",
        "260",
        "261",
        "262",
        "263",
        "264",
        "265",
        "266",
        "267",
        "268",
        "269",
        "27",
        "270",
        "271",
        "272",
        "273",
        "274",
        "275",
        "276",
        "277",
        "278",
        "279",
        "28",
        "280",
        "282",
        "283",
        "284",
        "285",
        "286",
        "287",
        "288",
        "289",
        "29",
        "290",
        "291",
        "292",
        "293",
        "294",
        "295",
        "296",
        "297",
        "298",
        "299",
        "3",
        "30",
        "300",
        "301",
        "302",
        "303",
        "304",
        "305",
        "306",
        "307",
        "308",
        "309",
        "31",
        "310",
        "311",
        "312",
        "313",
        "314",
        "315",
        "316",
        "317",
        "318",
        "319",
        "32",
        "320",
        "321",
        "322",
        "323",
        "324",
        "325",
        "326",
        "327",
        "328",
        "329",
        "33",
        "330",
        "331",
        "332",
        "333",
        "334",
        "335",
        "336",
        "337",
        "338",
        "339",
        "34",
        "340",
        "341",
        "342",
        "343",
        "344",
        "345",
        "346",
        "347",
        "348",
        "349",
        "35",
        "350",
        "351",
        "352",
        "353",
        "354",
        "355",
        "356",
        "357",
        "358",
        "359",
        "36",
        "360",
        "361",
        "362",
        "363",
        "37",
        "38",
        "39",
        "4",
        "40",
        "41",
        "42",
        "43",
        "44",
        "45",
        "46",
        "47",
        "48",
        "49",
        "5",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "555",
        "56",
        "57",
        "58",
        "59",
        "590",
        "591",
        "592",
        "6",
        "60",
        "61",
        "62",
        "63",
        "635",
        "64",
        "65",
        "658",
        "66",
        "67",
        "672",
        "68",
        "69",
        "7",
        "70",
        "700",
        "701",
        "702",
        "703",
        "704",
        "705",
        "707",
        "708",
        "71",
        "710",
        "72",
        "73",
        "74",
        "75",
        "758",
        "76",
        "77",
        "775",
        "776",
        "777",
        "778",
        "779",
        "78",
        "780",
        "781",
        "782",
        "783",
        "784",
        "785",
        "786",
        "787",
        "788",
        "789",
        "79",
        "790",
        "791",
        "792",
        "793",
        "8",
        "80",
        "81",
        "82",
        "83",
        "84",
        "85",
        "86",
        "87",
        "88",
        "888",
        "89",
        "9",
        "90",
        "91",
        "92",
        "93",
        "94",
        "95",
        "96",
        "97",
        "98",
        "99"
      ]
    },
    LanguageCode: {
      type: "string",
      enum: [
        "AA",
        "AB",
        "AF",
        "AM",
        "AR",
        "AS",
        "AY",
        "AZ",
        "BA",
        "BE",
        "BG",
        "BH",
        "BI",
        "BN",
        "BO",
        "BR",
        "CA",
        "CO",
        "CS",
        "CY",
        "DA",
        "DE",
        "DZ",
        "EL",
        "EN",
        "EO",
        "ES",
        "ET",
        "EU",
        "FA",
        "FI",
        "FJ",
        "FO",
        "FR",
        "FY",
        "GA",
        "GD",
        "GL",
        "GN",
        "GU",
        "HA",
        "HI",
        "HR",
        "HU",
        "HW",
        "HY",
        "IA",
        "IE",
        "IK",
        "IN",
        "IS",
        "IT",
        "IW",
        "JA",
        "JI",
        "JW",
        "KA",
        "KK",
        "KL",
        "KM",
        "KN",
        "KO",
        "KS",
        "KU",
        "KY",
        "LA",
        "LN",
        "LO",
        "LT",
        "LV",
        "MG",
        "MI",
        "MK",
        "ML",
        "MN",
        "MO",
        "MR",
        "MS",
        "MT",
        "MY",
        "NA",
        "ND",
        "NE",
        "NL",
        "NO",
        "NS",
        "OC",
        "OM",
        "OR",
        "PA",
        "PL",
        "PM",
        "PS",
        "PT",
        "QU",
        "RM",
        "RN",
        "RO",
        "RU",
        "RW",
        "SA",
        "SD",
        "SG",
        "SH",
        "SI",
        "SK",
        "SL",
        "SM",
        "SN",
        "SO",
        "SQ",
        "SR",
        "SS",
        "ST",
        "SU",
        "SV",
        "SW",
        "TA",
        "TE",
        "TG",
        "TH",
        "TI",
        "TK",
        "TL",
        "TN",
        "TO",
        "TR",
        "TS",
        "TT",
        "TW",
        "UK",
        "UR",
        "UZ",
        "VE",
        "VI",
        "VO",
        "WO",
        "XH",
        "YO",
        "ZH",
        "ZU"
      ]
    },
    RevocationReasonCode: {
      type: "string",
      enum: [
        "AN",
        "NC",
        "NE",
        "NM"
      ]
    },
    AnomalousWorkReasonCode: {
      type: "string",
      enum: [
        "IPS",
        "UNA"
      ]
    },
    Conventions: {
      additionalProperties: false,
      properties: {
        publisherShare: {
          type: "string",
          enum: [
            "summed",
            "perWriterChain"
          ]
        },
        writerControl: {
          type: "string",
          enum: [
            "swrOnly",
            "swrOwr"
          ]
        }
      },
      required: [
        "publisherShare",
        "writerControl"
      ],
      type: "object"
    },
    IdentifierNamespace: {
      additionalProperties: false,
      type: "object",
      required: [
        "type",
        "value"
      ],
      properties: {
        type: {
          type: "string",
          enum: [
            "ipiNameNumber",
            "cisacSociety",
            "cwrSubmitter",
            "dpid"
          ]
        },
        value: {
          type: "string"
        },
        name: {
          type: "string"
        }
      }
    },
    Tag: {
      additionalProperties: false,
      type: "object",
      required: [
        "name",
        "value"
      ],
      properties: {
        name: {
          type: "string",
          minLength: 1
        },
        value: {
          type: "array",
          minItems: 1,
          items: {
            type: "string",
            minLength: 1
          }
        }
      }
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

// src/validation/formatValidationErrors.ts
var AJV_RULE_HINTS = {
  pattern: /* @__PURE__ */ __name((err, path) => {
    const pattern = err.params?.pattern;
    if (path.includes("/iswc") && pattern?.includes("T")) {
      return {
        path,
        code: "ISWC_FORMAT",
        message: "ISWC must be dotted T-NNN.NNN.NNN-C, compact TNNNNNNNNNC, or intermediate T-NNNNNNNNN-C",
        detail: err.message || void 0
      };
    }
    if (path.endsWith("/ipi")) {
      return {
        path,
        code: "IPI_FORMAT",
        message: "IPI must be an 11-digit numeric string"
      };
    }
    if (path.includes("/isrc")) {
      return {
        path,
        code: "ISRC_FORMAT",
        message: "ISRC must match CC-XXX-YY-NNNNN (compact form accepted after normalize)"
      };
    }
    return {
      path,
      code: "PATTERN",
      message: err.message || "value does not match required format",
      detail: pattern ? `pattern: ${pattern}` : void 0
    };
  }, "pattern"),
  enum: /* @__PURE__ */ __name((err, path) => {
    const allowed = err.params?.allowedValues;
    const field = path.split("/").pop() || "value";
    if (field === "role") {
      return {
        path,
        code: "ROLE_CODE",
        message: `invalid party role "${formatValue(err.data)}"`,
        detail: allowed && allowed.length <= 16 ? `allowed: ${allowed.join(", ")}` : void 0
      };
    }
    if (path.includes("/territory/include") || path.includes("/territory/exclude")) {
      return {
        path,
        code: "TIS_CODE",
        message: `unknown or invalid TIS code "${formatValue(err.data)}"`
      };
    }
    return {
      path,
      code: "ENUM",
      message: `invalid ${field}: ${formatValue(err.data)}`,
      detail: allowed && allowed.length <= 8 ? `allowed: ${allowed.join(", ")}` : void 0
    };
  }, "enum"),
  maxItems: /* @__PURE__ */ __name((err, path) => {
    if (path.endsWith("/territory/include") || path.endsWith("/territory/exclude")) {
      return {
        path: territoryBasePath(path),
        code: "OWN_TERRITORY_TIS",
        message: 'ownership (shareTypes type "own") must use empty territory.include and territory.exclude',
        detail: "collection (coll) TIS codes belong on a separate territories[] entry"
      };
    }
    if (path.endsWith("/shareTypes")) {
      return {
        path: territoryBasePath(path),
        code: "OWN_COLL_MIXED",
        message: 'do not combine "own" and "coll" in the same territories[] entry',
        detail: "use one shareTypes block per entry (split into two territory rows)"
      };
    }
    return { path, code: "MAX_ITEMS", message: err.message || "too many items" };
  }, "maxItems"),
  if: /* @__PURE__ */ __name((err, path) => {
    if (path.includes("/territories/")) {
      return {
        path: territoryBasePath(path),
        code: "TERRITORY_LAYOUT",
        message: "territory entry does not satisfy ownership vs collection rules",
        detail: "see OWN_TERRITORY_TIS / OWN_COLL_MIXED (auto-normalize may fix combined rows)"
      };
    }
    if (path.includes("/identifiers/")) {
      return {
        path,
        code: "IDENTIFIER_RULE",
        message: "identifier value does not match rules for its source type"
      };
    }
    return { path, code: "IF", message: "conditional schema rule failed", detail: path };
  }, "if"),
  required: /* @__PURE__ */ __name((err, path) => {
    const missing = err.params?.missingProperty;
    const full = missing ? appendPath(path, missing) : path;
    return {
      path: full,
      code: "REQUIRED",
      message: `missing required field "${missing || "property"}"`
    };
  }, "required"),
  additionalProperties: /* @__PURE__ */ __name((err, path) => {
    const extra = err.params?.additionalProperty;
    return {
      path,
      code: "EXTRA_PROPERTY",
      message: `unexpected property "${extra}"`
    };
  }, "additionalProperties"),
  type: /* @__PURE__ */ __name((err, path) => {
    const expected = err.params?.type;
    return {
      path,
      code: "TYPE",
      message: `expected ${expected}, got ${typeof err.data}`
    };
  }, "type")
};
function formatValue(data) {
  if (data === void 0) return "(missing)";
  if (typeof data === "string") return data;
  return JSON.stringify(data);
}
__name(formatValue, "formatValue");
function appendPath(base, segment) {
  return base === "/" ? `/${segment}` : `${base}/${segment}`;
}
__name(appendPath, "appendPath");
function territoryBasePath(path) {
  const idx = path.indexOf("/territories/");
  if (idx === -1) return path;
  const rest = path.slice(idx + "/territories/".length);
  const entryIndex = rest.split("/")[0];
  return `${path.slice(0, idx)}/territories/${entryIndex}`;
}
__name(territoryBasePath, "territoryBasePath");
function formatPath(instancePath, err) {
  let path = instancePath.length ? instancePath : "/";
  if (err.keyword === "required" && err.params?.missingProperty) {
    path = appendPath(path, err.params.missingProperty);
  }
  return path;
}
__name(formatPath, "formatPath");
function ajvErrorToIssue(err) {
  const path = formatPath(err.instancePath, err);
  const mapper = AJV_RULE_HINTS[err.keyword];
  if (mapper) {
    const mapped = mapper(err, path);
    if (mapped) return mapped;
  }
  return {
    path,
    code: (err.keyword || "INVALID").toUpperCase(),
    message: err.message || "invalid value"
  };
}
__name(ajvErrorToIssue, "ajvErrorToIssue");
function issueKey(issue) {
  return `${issue.code}|${issue.path}`;
}
__name(issueKey, "issueKey");
function formatIssue(issue, index) {
  const detail = issue.detail ? ` (${issue.detail})` : "";
  return `${index}. ${issue.path} [${issue.code}]: ${issue.message}${detail}`;
}
__name(formatIssue, "formatIssue");
function dedupeIssues(issues) {
  const seen = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    let key = issueKey(issue);
    if (issue.code === "PUB_OWN_E_ONLY") {
      const subKey = `${issue.path}|SUBPUB_NO_OWN`;
      if (seen.has(subKey)) continue;
    }
    if (issue.code === "SUBPUB_NO_OWN") {
      key = `${issue.path}|SUBPUB_NO_OWN`;
    }
    if (!seen.has(key)) seen.set(key, issue);
  }
  return [...seen.values()];
}
__name(dedupeIssues, "dedupeIssues");
function formatSemanticError(line) {
  const match = line.match(/^(?:\d+\.\s+)?(\S+)\s+\[([A-Z_]+)\]:\s*(.+)$/);
  if (!match) return null;
  return { path: match[1], code: match[2], message: match[3] };
}
__name(formatSemanticError, "formatSemanticError");
function issuesToStrings(issues) {
  return issues.map((issue, i) => formatIssue(issue, i + 1));
}
__name(issuesToStrings, "issuesToStrings");

// src/validation/normalizeTerritories.ts
function cloneTerritoryEntry(entry) {
  return {
    ...entry,
    territory: {
      include: [...entry.territory?.include || []],
      exclude: [...entry.territory?.exclude || []]
    },
    shareTypes: (entry.shareTypes || []).map((st) => ({
      ...st,
      shares: Array.isArray(st.shares) ? [...st.shares] : st.shares
    })),
    ...entry.agreementNumber ? { agreementNumber: { ...entry.agreementNumber } } : {}
  };
}
__name(cloneTerritoryEntry, "cloneTerritoryEntry");
function territorySignature(entry) {
  const inc = (entry.territory?.include || []).join(",");
  const exc = (entry.territory?.exclude || []).join(",");
  const types = (entry.shareTypes || []).map((st) => st.type).join("+");
  return `${inc}|${exc}|${types}`;
}
__name(territorySignature, "territorySignature");
function splitMixedTerritoryEntry(entry) {
  const shareTypes = entry.shareTypes || [];
  const ownBlock = shareTypes.find((st) => st.type === "own");
  const collBlocks = shareTypes.filter((st) => st.type === "coll");
  const otherBlocks = shareTypes.filter((st) => st.type !== "own" && st.type !== "coll");
  const include = entry.territory?.include || [];
  const exclude = entry.territory?.exclude || [];
  const hasTis = include.length > 0 || exclude.length > 0;
  if (!ownBlock) {
    return [entry];
  }
  const hasColl = collBlocks.length > 0 || otherBlocks.length > 0;
  const mustSplit = hasColl || hasTis || shareTypes.length > 1;
  if (!mustSplit) {
    return [entry];
  }
  const rows = [
    {
      territory: { include: [], exclude: [] },
      shareTypes: [ownBlock],
      agreementNumber: entry.agreementNumber
    }
  ];
  if (hasColl) {
    rows.push({
      territory: { include: [...include], exclude: [...exclude] },
      shareTypes: [...collBlocks, ...otherBlocks],
      agreementNumber: entry.agreementNumber
    });
  }
  return rows;
}
__name(splitMixedTerritoryEntry, "splitMixedTerritoryEntry");
function stripSubPublisherOwnership(party, notes, path) {
  if (!party.role || !isSubPublisherRole(party.role)) return;
  let removed = false;
  for (const entry of party.territories || []) {
    const before = entry.shareTypes?.length || 0;
    entry.shareTypes = (entry.shareTypes || []).filter((st) => st.type !== "own");
    if ((entry.shareTypes?.length || 0) < before) removed = true;
  }
  party.territories = (party.territories || []).filter((t) => (t.shareTypes?.length || 0) > 0);
  if (removed) {
    notes.push(
      `${path}: removed ownership (own) shares for sub-publisher role ${party.role} (collection only in CWR-JSON)`
    );
  }
}
__name(stripSubPublisherOwnership, "stripSubPublisherOwnership");
function normalizePartyTerritories(party, notes, path) {
  stripSubPublisherOwnership(party, notes, path);
  const territories = party.territories || [];
  const next = [];
  territories.forEach((entry, index) => {
    const before = territorySignature(entry);
    const split = splitMixedTerritoryEntry(cloneTerritoryEntry(entry));
    const after = split.map(territorySignature).join("||");
    if (before !== after) {
      notes.push(
        `${path}/territories/${index}: split combined ownership (own) and collection (coll) into separate entries`
      );
    }
    next.push(...split);
  });
  party.territories = next;
  stripSubPublisherOwnership(party, notes, path);
  for (let i = 0; i < (party.representedBy || []).length; i++) {
    normalizePartyTerritories(party.representedBy[i], notes, `${path}/representedBy/${i}`);
  }
}
__name(normalizePartyTerritories, "normalizePartyTerritories");
function normalizeTerritoriesOnDocument(works, notes) {
  works.forEach((work, wi) => {
    (work.parties || []).forEach((party, pi) => {
      normalizePartyTerritories(party, notes, `/works/${wi}/parties/${pi}`);
    });
  });
}
__name(normalizeTerritoriesOnDocument, "normalizeTerritoriesOnDocument");

// src/validation/normalizeCwrJson.ts
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
__name(deepClone, "deepClone");
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
__name(isRecord, "isRecord");
function normalizeCwrJson(payload) {
  const notes = [];
  if (!isRecord(payload) || !Array.isArray(payload.works)) {
    return { data: payload, notes };
  }
  const data = deepClone(payload);
  data.works.forEach((work, wi) => {
    const iswcs = work.iswc || [];
    for (let i = 0; i < iswcs.length; i++) {
      const formatted = formatIswcForValidation(iswcs[i]);
      if (formatted && formatted !== iswcs[i]) {
        notes.push(
          `/works/${wi}/iswc/${i}: ISWC "${iswcs[i]}" \u2192 "${formatted}" (dotted ISO)`
        );
        iswcs[i] = formatted;
      }
    }
  });
  normalizeTerritoriesOnDocument(data.works, notes);
  normalizeShareSocietiesOnDocument(data.works, notes);
  return { data, notes };
}
__name(normalizeCwrJson, "normalizeCwrJson");
function normalizeShareSocietiesOnDocument(works, notes) {
  works.forEach((work, wi) => {
    for (const party of work.parties || []) {
      normalizePartyShareSocieties(party, notes, `/works/${wi}/parties`);
    }
  });
}
__name(normalizeShareSocietiesOnDocument, "normalizeShareSocietiesOnDocument");
function normalizePartyShareSocieties(party, notes, path) {
  for (let ti = 0; ti < (party.territories || []).length; ti++) {
    const territory = party.territories[ti];
    for (let sti = 0; sti < (territory.shareTypes || []).length; sti++) {
      const shareType = territory.shareTypes[sti];
      for (let si = 0; si < (shareType.shares || []).length; si++) {
        const share = shareType.shares[si];
        const raw = share.society;
        if (raw === void 0) continue;
        const canonical = presentSocietyCode(raw);
        const sharePath = `${path}/territories/${ti}/shareTypes/${sti}/shares/${si}`;
        if (!canonical) {
          delete share.society;
          notes.push(`${sharePath}: society "${raw}" omitted (no collecting society)`);
        } else if (canonical !== raw) {
          share.society = canonical;
        }
      }
    }
  }
  for (let ri = 0; ri < (party.representedBy || []).length; ri++) {
    normalizePartyShareSocieties(party.representedBy[ri], notes, `${path}/representedBy/${ri}`);
  }
}
__name(normalizePartyShareSocieties, "normalizePartyShareSocieties");

// src/validation/semanticValidation.ts
function formatError(path, rule, message) {
  return `${path} [${rule}]: ${message}`;
}
__name(formatError, "formatError");
function territoryHasOwn(territoryEntry) {
  return (territoryEntry.shareTypes || []).some((st) => st.type === "own");
}
__name(territoryHasOwn, "territoryHasOwn");
function checkTerritoryEntry(territoryEntry, ctx, errors, territoryIndex) {
  const base = `${ctx.path}/territories/${territoryIndex}`;
  const include = territoryEntry.territory?.include || [];
  const exclude = territoryEntry.territory?.exclude || [];
  const hasOwn = territoryHasOwn(territoryEntry);
  if (hasOwn) {
    if (include.length > 0 || exclude.length > 0) {
      errors.push(
        formatError(
          base,
          "OWN_EMPTY_TIS",
          "ownership (own) must not use TIS include/exclude; both arrays must be empty"
        )
      );
    }
  }
  const overlap = include.filter((c) => exclude.includes(c));
  if (overlap.length > 0) {
    errors.push(
      formatError(
        base,
        "TIS_OVERLAP",
        `TIS code(s) appear in both include and exclude: ${overlap.join(", ")}`
      )
    );
  }
  for (const code of [...include, ...exclude]) {
    if (code && !hasTisCode(code)) {
      errors.push(
        formatError(base, "TIS_UNKNOWN", `unknown TIS numeric code: ${code}`)
      );
    }
  }
  if (hasOwn && isSubPublisherRole(ctx.role)) {
    errors.push(
      formatError(
        base,
        "SUBPUB_NO_OWN",
        `role ${ctx.role} must not have shareTypes type "own" (sub-publishers are collection-only)`
      )
    );
  } else if (hasOwn && isPublisherRole(ctx.role) && ctx.role !== "E") {
    errors.push(
      formatError(
        base,
        "PUB_OWN_E_ONLY",
        `publisher role ${ctx.role} must not have ownership (own); only original publisher (E) may`
      )
    );
  }
}
__name(checkTerritoryEntry, "checkTerritoryEntry");
function walkParty(party, ctx, errors) {
  const territories = party.territories || [];
  territories.forEach((entry, ti) => checkTerritoryEntry(entry, ctx, errors, ti));
  const reps = party.representedBy || [];
  reps.forEach((child, ri) => {
    walkParty(child, { ...ctx, path: `${ctx.path}/representedBy/${ri}`, role: child.role }, errors);
  });
}
__name(walkParty, "walkParty");
function collectSubmitterIds(payload) {
  const map = /* @__PURE__ */ new Map();
  payload.works.forEach((work, wi) => {
    for (const id of work.identifiers || []) {
      if (id.type !== "submitterWorkId" || !id.value) continue;
      const list = map.get(id.value) || [];
      list.push(wi);
      map.set(id.value, list);
    }
  });
  return map;
}
__name(collectSubmitterIds, "collectSubmitterIds");
function validateCwrJsonSemantic(payload) {
  if (!payload || typeof payload !== "object" || !("works" in payload)) {
    return [];
  }
  const doc = payload;
  if (!Array.isArray(doc.works)) {
    return [];
  }
  const errors = [];
  doc.works.forEach((work, wi) => {
    const parties = work.parties || [];
    parties.forEach((party, pi) => {
      const ctx = {
        workIndex: wi,
        path: `/works/${wi}/parties/${pi}`,
        role: party.role
      };
      walkParty(party, ctx, errors);
    });
  });
  const submitterMap = collectSubmitterIds(doc);
  for (const [value, workIndices] of submitterMap) {
    const unique = [...new Set(workIndices)];
    if (unique.length > 1) {
      errors.push(
        formatError(
          "/",
          "ID_UNIQUE_SUBMITTER",
          `duplicate submitterWorkNumber "${value}" in works: ${unique.map((i) => i.toString()).join(", ")}`
        )
      );
    }
  }
  return errors;
}
__name(validateCwrJsonSemantic, "validateCwrJsonSemantic");

// src/validation/schemaValidation.ts
var DEFAULT_SCHEMA_ID = "cwr-json-v1-0";
var ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);
var validatorCache = /* @__PURE__ */ new Map();
function getValidator(schemaId = DEFAULT_SCHEMA_ID) {
  const cached = validatorCache.get(schemaId);
  if (cached) return cached;
  const validator = ajv.compile(getSchemaAsset(schemaId));
  validatorCache.set(schemaId, validator);
  return validator;
}
__name(getValidator, "getValidator");
function prefixNotes(notes) {
  if (!notes.length) return [];
  const header = notes.length === 1 ? "Auto-fixed before validation:" : `Auto-fixed ${notes.length} item(s) before validation:`;
  const body = notes.length <= 5 ? notes : [...notes.slice(0, 5), `\u2026and ${notes.length - 5} more`];
  return [header, ...body.map((n) => `  \u2022 ${n}`)];
}
__name(prefixNotes, "prefixNotes");
function validateCwrJson(payload, mode = "strict", schemaId = DEFAULT_SCHEMA_ID, options = {}) {
  const normalize = options.normalize !== false;
  try {
    const { data, notes } = normalize ? normalizeCwrJson(payload) : { data: payload, notes: [] };
    const validator = getValidator(schemaId);
    const schemaValid = Boolean(validator(data));
    const ajvIssues = dedupeIssues((validator.errors || []).map(ajvErrorToIssue));
    const semanticIssues = dedupeIssues(
      validateCwrJsonSemantic(data).map((line) => formatSemanticError(line)).filter((x) => x !== null)
    );
    const allIssues = dedupeIssues([...ajvIssues, ...semanticIssues]);
    const errors = issuesToStrings(allIssues);
    const warnings = prefixNotes(notes);
    const valid = schemaValid && semanticIssues.length === 0;
    if (mode === "advisory") {
      return { valid: true, errors, warnings: warnings.length ? warnings : void 0 };
    }
    return {
      valid,
      errors,
      warnings: warnings.length ? warnings : void 0
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      errors: [`1. / [SETUP]: validation failed to run (${message})`]
    };
  }
}
__name(validateCwrJson, "validateCwrJson");
function validateParsedCwr(payload, mode = "strict", options) {
  return validateCwrJson(payload, mode, DEFAULT_SCHEMA_ID, options);
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
  formatIswcForValidation,
  normalizeCwrJson,
  parseCwr,
  validateCwrEdi,
  validateCwrFilename2 as validateCwrFilename,
  validateCwrJson,
  validateCwrRecordOrder,
  validateCwrSequence,
  validateParsedCwr
};
//# sourceMappingURL=index.js.map