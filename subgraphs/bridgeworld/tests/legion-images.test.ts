import { assert, test } from "matchstick-as";

import { BigInt } from "@graphprotocol/graph-ts";

import { LEGION_IPFS } from "../src/helpers/constants";
import {
  getLegacyGenesisLegionImage,
  getLegacyLegionImage,
  getLegionImage,
  getRecruitImage,
} from "../src/helpers/legion";

test("legion images are correct", () => {
  const expectedLegions = [
    [
      "Auxiliary",
      "Common",
      "Assassin",
      "1",
      "",
      "/Auxiliary/Common/Assassin/1A.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Fighter",
      "2",
      "",
      "/Auxiliary/Common/Fighter/1B.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Ranger",
      "3",
      "",
      "/Auxiliary/Common/Ranger/1B.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Siege",
      "4",
      "",
      "/Auxiliary/Common/Siege/1C.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Spellcaster",
      "5",
      "",
      "/Auxiliary/Common/Spellcaster/1C.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Assassin",
      "6",
      "",
      "/Auxiliary/Common/Assassin/1D.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Fighter",
      "7",
      "",
      "/Auxiliary/Common/Fighter/1D.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Ranger",
      "8",
      "",
      "/Auxiliary/Common/Ranger/1E.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Siege",
      "9",
      "",
      "/Auxiliary/Common/Siege/1E.webp",
    ],
    [
      "Auxiliary",
      "Common",
      "Spellcaster",
      "10",
      "",
      "/Auxiliary/Common/Spellcaster/1A.webp",
    ],
    ["Recruit", "None", "None", "123", "", "/Recruit/Recruit.webp"],
    ["Recruit", "None", "None", "134", "", "/Recruit/Recruit.webp"],
    ["Recruit", "None", "None", "156", "", "/Recruit/Recruit.webp"],
    ["Recruit", "None", "None", "167", "", "/Recruit/Recruit.webp"],
    [
      "Auxiliary",
      "Uncommon",
      "Assassin",
      "12101",
      "",
      "/Auxiliary/Uncommon/Assassin/1A.webp",
    ],
    [
      "Auxiliary",
      "Uncommon",
      "Fighter",
      "12132",
      "",
      "/Auxiliary/Uncommon/Fighter/2B.webp",
    ],
    [
      "Auxiliary",
      "Uncommon",
      "Ranger",
      "12158",
      "",
      "/Auxiliary/Uncommon/Ranger/3E.webp",
    ],
    [
      "Auxiliary",
      "Uncommon",
      "Siege",
      "12171",
      "",
      "/Auxiliary/Uncommon/Siege/4A.webp",
    ],
    [
      "Auxiliary",
      "Uncommon",
      "Spellcaster",
      "12192",
      "",
      "/Auxiliary/Uncommon/Spellcaster/5B.webp",
    ],
    [
      "Genesis",
      "Legendary",
      "Bombmaker",
      "2345",
      "50",
      "/Genesis/Legendary/Bombmaker.webp",
    ],
    [
      "Genesis",
      "Legendary",
      "Clocksnatcher",
      "2345",
      "55",
      "/Genesis/Legendary/Clocksnatcher.webp",
    ],
    [
      "Genesis",
      "Legendary",
      "Dreamwinder",
      "2345",
      "78",
      "/Genesis/Legendary/Dreamwinder.webp",
    ],
    [
      "Genesis",
      "Legendary",
      "Fallen",
      "2345",
      "81",
      "/Genesis/Legendary/Fallen.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12312",
      "1",
      "/Genesis/Rare/Executioner/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12342",
      "2",
      "/Genesis/Rare/Clockwork Marine/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12388",
      "3",
      "/Genesis/Rare/Shadowguard/5E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12363",
      "4",
      "/Genesis/Rare/Ashen Kingsguard/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12338",
      "5",
      "/Genesis/Rare/Reaper/2E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12300",
      "6",
      "/Genesis/Rare/Reaper/1A.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12310",
      "7",
      "/Genesis/Rare/Reaper/4A.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12322",
      "8",
      "/Genesis/Rare/Reaper/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12329",
      "9",
      "/Genesis/Rare/Reaper/2E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12337",
      "10",
      "/Genesis/Rare/Shadowguard/4D.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12391",
      "11",
      "/Genesis/Rare/Shadowguard/3A.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12383",
      "12",
      "/Genesis/Rare/Shadowguard/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12347",
      "13",
      "/Genesis/Rare/Executioner/1D.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12358",
      "14",
      "/Genesis/Rare/Executioner/3E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12388",
      "15",
      "/Genesis/Rare/Executioner/3E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12344",
      "16",
      "/Genesis/Rare/Executioner/3C.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12328",
      "17",
      "/Genesis/Rare/Clockwork Marine/4E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12347",
      "18",
      "/Genesis/Rare/Clockwork Marine/1D.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12381",
      "19",
      "/Genesis/Rare/Clockwork Marine/4A.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12303",
      "20",
      "/Genesis/Rare/Clockwork Marine/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12353",
      "21",
      "/Genesis/Rare/Ashen Kingsguard/1B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12342",
      "22",
      "/Genesis/Rare/Ashen Kingsguard/1B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12383",
      "23",
      "/Genesis/Rare/Ashen Kingsguard/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12301",
      "24",
      "/Genesis/Rare/Reaper/4A.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12389",
      "25",
      "/Genesis/Rare/Shadowguard/4E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12398",
      "26",
      "/Genesis/Rare/Executioner/4E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12347",
      "27",
      "/Genesis/Rare/Clockwork Marine/4D.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12392",
      "28",
      "/Genesis/Rare/Reaper/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12383",
      "29",
      "/Genesis/Rare/Shadowguard/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12319",
      "30",
      "/Genesis/Rare/Executioner/3E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12383",
      "31",
      "/Genesis/Rare/Clockwork Marine/3B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12374",
      "32",
      "/Genesis/Rare/Reaper/2C.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12382",
      "33",
      "/Genesis/Rare/Executioner/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12373",
      "34",
      "/Genesis/Rare/Clockwork Marine/2B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12348",
      "35",
      "/Genesis/Rare/Reaper/4E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12392",
      "36",
      "/Genesis/Rare/Shadowguard/4B.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12339",
      "37",
      "/Genesis/Rare/Executioner/4E.webp",
    ],
    [
      "Genesis",
      "Rare",
      "All-Class",
      "12332",
      "38",
      "/Genesis/Rare/Clockwork Marine/5B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12482",
      "106",
      "/Genesis/Special/Numeraire/5B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12429",
      "107",
      "/Genesis/Special/Numeraire/3E.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12491",
      "108",
      "/Genesis/Special/Numeraire/3A.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12421",
      "109",
      "/Genesis/Special/Numeraire/3A.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12411",
      "110",
      "/Genesis/Special/Numeraire/1A.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12483",
      "111",
      "/Genesis/Special/Numeraire/4B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12493",
      "112",
      "/Genesis/Special/Numeraire/2B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Numeraire",
      "12429",
      "113",
      "/Genesis/Special/Numeraire/1E.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12582",
      "134",
      "/Genesis/Special/Riverman/4B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12523",
      "135",
      "/Genesis/Special/Riverman/1B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12521",
      "136",
      "/Genesis/Special/Riverman/4A.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12593",
      "137",
      "/Genesis/Special/Riverman/4B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12520",
      "138",
      "/Genesis/Special/Riverman/5A.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12592",
      "139",
      "/Genesis/Special/Riverman/3B.webp",
    ],
    [
      "Genesis",
      "Special",
      "Riverman",
      "12521",
      "140",
      "/Genesis/Special/Riverman/2A.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Assassin",
      "12683",
      "40",
      "/Genesis/Uncommon/Assassin/1B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Assassin",
      "12634",
      "41",
      "/Genesis/Uncommon/Assassin/3C.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Assassin",
      "12632",
      "42",
      "/Genesis/Uncommon/Assassin/2B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Assassin",
      "12698",
      "43",
      "/Genesis/Uncommon/Assassin/5E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Assassin",
      "12603",
      "44",
      "/Genesis/Uncommon/Assassin/4B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12632",
      "83",
      "/Genesis/Uncommon/Fighter/1B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12666",
      "84",
      "/Genesis/Uncommon/Fighter/4D.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12202",
      "85",
      "/Genesis/Uncommon/Fighter/5B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12192",
      "86",
      "/Genesis/Uncommon/Fighter/2B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12293",
      "87",
      "/Genesis/Uncommon/Fighter/1B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12845",
      "88",
      "/Genesis/Uncommon/Fighter/3C.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Fighter",
      "12822",
      "89",
      "/Genesis/Uncommon/Fighter/3B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12400",
      "118",
      "/Genesis/Uncommon/Ranger/3A.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12092",
      "119",
      "/Genesis/Uncommon/Ranger/2B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12029",
      "120",
      "/Genesis/Uncommon/Ranger/3E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12820",
      "121",
      "/Genesis/Uncommon/Ranger/4A.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12982",
      "122",
      "/Genesis/Uncommon/Ranger/4B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12298",
      "123",
      "/Genesis/Uncommon/Ranger/2E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12280",
      "124",
      "/Genesis/Uncommon/Ranger/2A.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12349",
      "125",
      "/Genesis/Uncommon/Ranger/1E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12209",
      "126",
      "/Genesis/Uncommon/Ranger/5E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12200",
      "127",
      "/Genesis/Uncommon/Ranger/4A.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12848",
      "128",
      "/Genesis/Uncommon/Ranger/3E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12493",
      "129",
      "/Genesis/Uncommon/Ranger/2B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Ranger",
      "12404",
      "130",
      "/Genesis/Uncommon/Ranger/5C.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12209",
      "144",
      "/Genesis/Uncommon/Siege/4E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12439",
      "145",
      "/Genesis/Uncommon/Siege/2E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12402",
      "146",
      "/Genesis/Uncommon/Siege/3B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12209",
      "147",
      "/Genesis/Uncommon/Siege/5E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12242",
      "148",
      "/Genesis/Uncommon/Siege/5B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Siege",
      "12029",
      "149",
      "/Genesis/Uncommon/Siege/1E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12353",
      "154",
      "/Genesis/Uncommon/Spellcaster/5B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12345",
      "155",
      "/Genesis/Uncommon/Spellcaster/3C.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12243",
      "156",
      "/Genesis/Uncommon/Spellcaster/2B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12029",
      "157",
      "/Genesis/Uncommon/Spellcaster/2E.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12832",
      "158",
      "/Genesis/Uncommon/Spellcaster/4B.webp",
    ],
    [
      "Genesis",
      "Uncommon",
      "Spellcaster",
      "12389",
      "159",
      "/Genesis/Uncommon/Spellcaster/1E.webp",
    ],
    [
      "Genesis",
      "Legendary",
      "Warlock",
      "12209",
      "163",
      "/Genesis/Legendary/Warlock.webp",
    ],
    [
      "Genesis",
      "Common",
      "Assassin",
      "12134",
      "",
      "/Genesis/Common/Assassin/2C.webp",
    ],
    [
      "Genesis",
      "Common",
      "Fighter",
      "12872",
      "",
      "/Genesis/Common/Fighter/4B.webp",
    ],
    [
      "Genesis",
      "Common",
      "Siege",
      "12911",
      "",
      "/Genesis/Common/Siege/1A.webp",
    ],
    [
      "Genesis",
      "Common",
      "Ranger",
      "12341",
      "",
      "/Genesis/Common/Ranger/3A.webp",
    ],
    [
      "Genesis",
      "Common",
      "Spellcaster",
      "12777",
      "",
      "/Genesis/Common/Spellcaster/4D.webp",
    ],
  ];

  for (let i = 0; i < expectedLegions.length; i++) {
    const legion = expectedLegions[i];
    const image = getLegionImage(
      LEGION_IPFS,
      legion[0],
      legion[1],
      legion[2],
      BigInt.fromString(legion[3]),
      legion[4] != "" ? BigInt.fromString(legion[4]) : null
    );
    assert.stringEquals(`${LEGION_IPFS}${legion[5]}`, image);
  }
});

test("legacy legion images are correct", () => {
  const image = getLegacyLegionImage(LEGION_IPFS, BigInt.fromI32(1214));
  assert.stringEquals(`${LEGION_IPFS}/Auxiliary/Unpilgrimaged/1C.webp`, image);
});

test("legacy genesis legion images are correct", () => {
  const expectedLegions = [
    ["Legendary", "81", "/Genesis/Legendary/Fallen.webp"],
    ["Rare", "1", "/Genesis/Rare/Executioner/3A.webp"],
    ["Rare", "2", "/Genesis/Rare/Clockwork Marine/2B.webp"],
    ["Special", "106", "/Genesis/Special/Numeraire/5D.webp"],
    ["Special", "107", "/Genesis/Special/Numeraire/3D.webp"],
    ["Special", "134", "/Genesis/Special/Riverman/4C.webp"],
    ["Special", "135", "/Genesis/Special/Riverman/1C.webp"],
    ["Uncommon", "40", "/Genesis/Uncommon/Assassin/1A.webp"],
    ["Uncommon", "41", "/Genesis/Uncommon/Assassin/3A.webp"],
    ["Uncommon", "83", "/Genesis/Uncommon/Fighter/1B.webp"],
    ["Uncommon", "84", "/Genesis/Uncommon/Fighter/4C.webp"],
    ["Uncommon", "118", "/Genesis/Uncommon/Ranger/3E.webp"],
    ["Uncommon", "119", "/Genesis/Uncommon/Ranger/2E.webp"],
    ["Uncommon", "144", "/Genesis/Uncommon/Siege/4C.webp"],
    ["Uncommon", "145", "/Genesis/Uncommon/Siege/2C.webp"],
    ["Uncommon", "154", "/Genesis/Uncommon/Spellcaster/5C.webp"],
    ["Uncommon", "155", "/Genesis/Uncommon/Spellcaster/3C.webp"],
    ["Common", "56", "/Genesis/Common/Siege/3D.webp"],
    ["Common", "58", "/Genesis/Common/Ranger/3E.webp"],
    ["Common", "61", "/Genesis/Common/Fighter/4A.webp"],
    ["Common", "64", "/Genesis/Common/Spellcaster/4C.webp"],
  ];

  for (let i = 0; i < expectedLegions.length; i++) {
    const legion = expectedLegions[i];
    const image = getLegacyGenesisLegionImage(
      LEGION_IPFS,
      BigInt.fromString(legion[1]),
      legion[0]
    );
    assert.stringEquals(`${LEGION_IPFS}${legion[2]}`, image);
  }
});

test("Recruit images are correct", () => {
  const recruitImage = getRecruitImage(LEGION_IPFS, "None");
  assert.stringEquals(`${LEGION_IPFS}/Recruit/Recruit.webp`, recruitImage);

  const cognitionImage = getRecruitImage(LEGION_IPFS, "Cognition");
  assert.stringEquals(`${LEGION_IPFS}/Recruit/Cognition.webp`, cognitionImage);

  const parabolicsImage = getRecruitImage(LEGION_IPFS, "Parabolics");
  assert.stringEquals(
    `${LEGION_IPFS}/Recruit/Parabolics.webp`,
    parabolicsImage
  );

  const lethalityImage = getRecruitImage(LEGION_IPFS, "Lethality");
  assert.stringEquals(`${LEGION_IPFS}/Recruit/Lethality.webp`, lethalityImage);

  const assassinImage = getRecruitImage(LEGION_IPFS, "Assassin");
  assert.stringEquals(`${LEGION_IPFS}/Recruit/Assassin.webp`, assassinImage);

  const rangerImage = getRecruitImage(LEGION_IPFS, "Ranger");
  assert.stringEquals(`${LEGION_IPFS}/Recruit/Ranger.webp`, rangerImage);
});
