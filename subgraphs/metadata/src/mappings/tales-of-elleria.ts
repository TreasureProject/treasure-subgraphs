import {
  Address,
  BigInt,
  Bytes,
  TypedMap,
  json,
  log,
} from "@graphprotocol/graph-ts";

import { TALES_OF_ELLERIA_ADDRESS } from "@treasure/constants";

import {
  AttributeChange,
  LevelChange,
} from "../../generated/Tales of Elleria Data/TalesOfElleria";
import { ERC721, Transfer } from "../../generated/Tales of Elleria/ERC721";
import { Collection, Token } from "../../generated/schema";
import { getAttributeId } from "../helpers/ids";
import {
  updateAttributePercentages,
  updateTokenMetadata,
} from "../helpers/metadata";
import {
  getOrCreateAttribute,
  getOrCreateCollection,
  getOrCreateToken,
} from "../helpers/models";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

const RARITY = ["Common", "Epic", "Legendary", "Jester", "Plague Doctor"];

const FALLBACK_IMAGES = new TypedMap<string, string>();

FALLBACK_IMAGES.set(
  "Ranger0",
  "https://ipfs.moralis.io:2053/ipfs/QmZZGVv1rHm6KQ5ng7ehT9Dd38wnSCFZD9tWFfKgRpyeMa"
);
FALLBACK_IMAGES.set(
  "Assassin0",
  "https://ipfs.moralis.io:2053/ipfs/QmVVGAmNvUgUhyLy3HPKmwbzCnRfjGrV9kjW1G6ALUZUNF"
);
FALLBACK_IMAGES.set(
  "Mage0",
  "https://ipfs.moralis.io:2053/ipfs/QmVWzYTi7pYBZcMrzoHJ82ucRxPxVyEUNPZDtjbewzhfEC"
);
FALLBACK_IMAGES.set(
  "Warrior0",
  "https://ipfs.moralis.io:2053/ipfs/QmXdUDFBCx3MfCMZK9nK3AeFayxCYi7SiKU4xz98MdMC49"
);
FALLBACK_IMAGES.set(
  "Ranger1",
  "https://ipfs.moralis.io:2053/ipfs/QmSvcrDYijxrZ5Fpz97P3t2dChEnq2syNwLQ6qGZ2nDzKc"
);
FALLBACK_IMAGES.set(
  "Assassin1",
  "https://ipfs.moralis.io:2053/ipfs/Qmd66PRkYUWN78VUSzYyxmZeP4zLpC8Wroif3QNCyofvj7"
);
FALLBACK_IMAGES.set(
  "Mage1",
  "https://ipfs.moralis.io:2053/ipfs/QmQuAxvgQP9r8cuV8sJxrjA7ttZYb2UdM4JdC17PgWv29U"
);
FALLBACK_IMAGES.set(
  "Warrior1",
  "https://ipfs.moralis.io:2053/ipfs/QmbXmaaWNFx8jK9DaxGF3x4Zj9RbTaRKQF3UkhuLfQLheG"
);
FALLBACK_IMAGES.set(
  "Ranger2",
  "https://ipfs.moralis.io:2053/ipfs/QmWBudHCS6wcSeJTVbHSYPddnLaBGdPJbHynwYG95Ambs3"
);
FALLBACK_IMAGES.set(
  "Assassin2",
  "https://ipfs.moralis.io:2053/ipfs/QmP8X5uSrp6D4HGCkQ7asTQAaRxsn2eVS4TcapEf5evk4f"
);
FALLBACK_IMAGES.set(
  "Mage2",
  "https://ipfs.moralis.io:2053/ipfs/QmVdphWGBK78DupEntsxDut2mks9ihitxzu21hkpQJGVQ8"
);
FALLBACK_IMAGES.set(
  "Warrior2",
  "https://ipfs.moralis.io:2053/ipfs/QmXB9VvdGXGu7gbmcKGamhJpTLYrtJFrtyeGf2YzgFHA3J"
);
FALLBACK_IMAGES.set(
  "Jester",
  "https://ipfs.moralis.io:2053/ipfs/QmdvJr2XjPoepJoxT8kH6RGJeuxopCpC2JahQfrtGATdkE"
);
FALLBACK_IMAGES.set(
  "Plague Doctor",
  "https://ipfs.moralis.io:2053/ipfs/QmafevGMgE4pTF1Z3UjL3PBm2SZqj3ZSK6Hue7iKte5Rk1"
);

const JESTER_IDS = [
  2, 3, 5, 6, 7, 8, 9, 14, 15, 16, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 30,
  32, 33, 35, 36, 39, 41, 44, 47, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62,
  63, 65, 71, 72, 73, 76, 78, 79, 81, 83, 90, 91, 92, 95, 97, 98, 99, 100, 101,
  107, 108, 111, 119, 121, 124, 133, 134, 135, 137, 147, 150, 151, 152, 153,
  155, 156, 158, 161, 163, 165, 167, 173, 174, 175, 176, 179, 189, 190, 192,
  196, 198, 210, 215, 222, 224, 232, 233, 238, 241, 242, 245, 260, 271, 277,
  283, 286, 292, 296, 306, 308, 309, 310, 313, 314, 315, 317, 318, 320, 327,
  329, 336, 347, 348, 351, 357, 362, 363, 365, 367, 381, 384, 385, 388, 389,
  390, 398, 399, 406, 407, 408, 411, 414, 415, 416, 417, 419, 421, 423, 438,
  440, 442, 443, 452, 458, 459, 460, 461, 465, 470, 471, 474, 482, 483, 486,
  488, 490, 492, 494, 502, 503, 506, 507, 524, 528, 538, 539, 542, 545, 553,
  554, 555, 557, 559, 560, 563, 565, 569, 571, 572, 573, 574, 576, 578, 579,
  580, 582, 583, 584, 587, 588, 589, 591, 595, 598, 600, 606, 607, 610, 611,
  612, 616, 622, 625, 626, 628, 629, 630, 632, 633, 634, 636, 639, 640, 642,
  644, 646, 650, 651, 655, 659, 660, 661, 668, 669, 670, 671, 673, 675, 677,
  678, 681, 689, 690, 692, 695, 696, 697, 699, 700, 701, 703, 704, 706, 708,
  709, 710, 713, 716, 718, 720, 721, 723, 724, 725, 727, 729, 731, 733, 735,
  739, 740, 741, 742, 743, 744, 745, 747, 748, 750, 752, 753, 754, 759, 760,
  761, 763, 764, 775, 777, 780, 781, 784, 789, 793, 802, 808, 809, 810, 814,
  816, 819, 821, 822, 825, 828, 833, 837, 838, 843, 846, 850, 851, 857, 859,
  860, 861, 871, 873, 874, 878, 879, 885, 887, 888, 890, 891, 892, 896, 899,
  902, 906, 908, 909, 911, 912, 914, 915, 917, 921, 923, 924, 926, 929, 931,
  934, 935, 942, 943, 945, 953, 958, 969, 974, 977, 978, 979, 980, 982, 985,
  987, 989, 990, 992, 995, 996, 997, 999, 1000, 1001, 1003, 1007, 1009, 1010,
  1011, 1013, 1015, 1017, 1018, 1021, 1023, 1033, 1034, 1041, 1042, 1049, 1051,
  1054, 1057, 1058, 1060, 1061, 1064, 1066, 1067, 1070, 1073, 1075, 1081, 1082,
  1086, 1087, 1089, 1102, 1104, 1105, 1107, 1108, 1109, 1111, 1113, 1115, 1117,
  1118, 1119, 1123, 1124, 1126, 1130, 1134, 1135, 1136, 1137, 1138, 1139, 1140,
  1141, 1143, 1145, 1147, 1149, 1154, 1156, 1158, 1161, 1165, 1166, 1167, 1169,
  1170, 1171, 1173, 1177, 1180, 1181, 1187, 1191, 1192, 1195, 1196, 1197, 1200,
  1201, 1207, 1209, 1211, 1213,
];

const PLAGUE_DOCTER_IDS = [
  0, 24, 29, 34, 38, 45, 59, 61, 66, 69, 82, 94, 104, 106, 109, 110, 112, 113,
  115, 117, 118, 122, 123, 126, 127, 128, 129, 130, 131, 132, 136, 138, 140,
  141, 142, 143, 145, 146, 148, 157, 159, 164, 168, 169, 178, 182, 183, 184,
  187, 188, 193, 194, 199, 200, 205, 207, 208, 212, 213, 219, 220, 221, 223,
  228, 229, 230, 237, 240, 243, 246, 247, 248, 249, 251, 252, 253, 255, 256,
  257, 258, 259, 262, 267, 268, 269, 273, 274, 276, 280, 281, 284, 287, 288,
  291, 293, 298, 300, 301, 302, 305, 307, 311, 312, 316, 319, 322, 323, 324,
  326, 330, 331, 335, 337, 338, 340, 343, 344, 345, 346, 350, 353, 355, 358,
  359, 360, 364, 366, 372, 373, 374, 376, 378, 379, 380, 387, 391, 392, 395,
  397, 402, 404, 410, 422, 424, 425, 429, 430, 431, 432, 433, 434, 435, 436,
  437, 439, 441, 445, 446, 447, 448, 449, 450, 453, 454, 455, 456, 457, 462,
  463, 464, 468, 469, 473, 478, 485, 487, 491, 493, 495, 497, 498, 500, 501,
  504, 505, 508, 510, 511, 513, 515, 516, 518, 519, 520, 521, 522, 523, 525,
  526, 527, 529, 531, 533, 534, 540, 541, 544, 546, 549, 550, 552, 556, 561,
  566, 570, 581, 586, 597, 599, 604, 614, 615, 620, 621, 623, 624, 637, 641,
  645, 649, 654, 657, 662, 664, 680, 687, 688, 691, 694, 698, 702, 705, 726,
  728, 732, 736, 737, 746, 749, 755, 756, 765, 767, 768, 769, 770, 771, 772,
  773, 774, 778, 779, 787, 788, 792, 795, 797, 798, 799, 800, 801, 803, 804,
  806, 818, 820, 832, 836, 842, 844, 845, 847, 848, 849, 853, 856, 863, 866,
  867, 870, 872, 875, 881, 884, 889, 897, 900, 903, 904, 905, 907, 910, 918,
  920, 930, 933, 937, 938, 940, 944, 948, 954, 955, 956, 957, 959, 960, 961,
  962, 963, 964, 967, 968, 970, 971, 972, 973, 975, 976, 983, 988, 993, 994,
  1006, 1012, 1020, 1025, 1026, 1031, 1032, 1035, 1036, 1038, 1040, 1043, 1047,
  1053, 1063, 1068, 1071, 1072, 1076, 1079, 1080, 1083, 1088, 1090, 1093, 1096,
  1097, 1099, 1101, 1110, 1112, 1114, 1116, 1121, 1122, 1125, 1127, 1131, 1142,
  1146, 1148, 1150, 1151, 1152, 1153, 1155, 1160, 1162, 1172, 1175, 1176, 1183,
  1184, 1185, 1188, 1189, 1193, 1199, 1202, 1203, 1208, 1210,
];

class Stat {
  constructor(public name: string, public value: string) {}
}

class Stats {
  constructor(
    public strength: Stat,
    public agility: Stat,
    public vitality: Stat,
    public endurance: Stat,
    public intelligence: Stat,
    public will: Stat
  ) {}
}

enum Metadata {
  TokenId,
  Image,
  Strength,
  Agility,
  Vitality,
  Endurance,
  Intelligence,
  Will,
  TotalAttributes,
  ClassId,
  ClassName,
  Level,
  Experience,
  TimeSummoned,
  RarityId,
  IsStaked,
}

function getMaxStats(classId: i32): Stats {
  let stats = new Stats(
    new Stat("Max Strength", "0"),
    new Stat("Max Agility", "0"),
    new Stat("Max Vitality", "0"),
    new Stat("Max Endurance", "0"),
    new Stat("Max Intelligence", "0"),
    new Stat("Max Will", "0")
  );

  switch (classId) {
    case 1: // Warrior
      stats.strength.value = "100";
      stats.agility.value = "75";
      stats.vitality.value = "90";
      stats.endurance.value = "80";
      stats.intelligence.value = "50";
      stats.will.value = "50";

      break;
    case 2: // Assassin
      stats.strength.value = "90";
      stats.agility.value = "100";
      stats.vitality.value = "75";
      stats.endurance.value = "50";
      stats.intelligence.value = "50";
      stats.will.value = "80";

      break;
    case 3: // Mage
      stats.strength.value = "50";
      stats.agility.value = "80";
      stats.vitality.value = "50";
      stats.endurance.value = "75";
      stats.intelligence.value = "100";
      stats.will.value = "90";

      break;
    case 4: // Ranger
      stats.strength.value = "100";
      stats.agility.value = "90";
      stats.vitality.value = "75";
      stats.endurance.value = "50";
      stats.intelligence.value = "50";
      stats.will.value = "80";

      break;
  }

  return stats;
}

function getRarityId(tokenId: i32, totalStats: i32): i32 {
  if (JESTER_IDS.includes(tokenId)) {
    return 3;
  }

  if (PLAGUE_DOCTER_IDS.includes(tokenId)) {
    return 4;
  }

  return totalStats < 300 ? 0 : totalStats > 375 ? 2 : 1;
}

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Hero #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const metadata = tokenUri.value.split(";");
    if (metadata.length >= 16) {
      const totalStats = parseInt(metadata[Metadata.TotalAttributes]) as i32;
      const rarityId = getRarityId(token.tokenId.toI32(), totalStats);
      const class_ = new Stat("Class", metadata[Metadata.ClassName]);
      const rarity = new Stat("Rarity", RARITY[rarityId]);
      const fallbackKey =
        rarityId > 2
          ? rarity.value
          : `${metadata[Metadata.ClassName]}${rarityId}`;
      const image = changetype<string>(FALLBACK_IMAGES.get(fallbackKey));
      const level = new Stat("Level", metadata[Metadata.Level]);
      const strength = new Stat("Strength", metadata[Metadata.Strength]);
      const agility = new Stat("Agility", metadata[Metadata.Agility]);
      const vitality = new Stat("Vitality", metadata[Metadata.Vitality]);
      const endurance = new Stat("Endurance", metadata[Metadata.Endurance]);
      const intelligence = new Stat(
        "Intelligence",
        metadata[Metadata.Intelligence]
      );
      const will = new Stat("Will", metadata[Metadata.Will]);
      const total = new Stat("Total Stats", metadata[Metadata.TotalAttributes]);
      const maxTotal = new Stat("Max Total Stats", "445");
      const max = getMaxStats(parseInt(metadata[Metadata.ClassId]) as i32);

      const attributes = [
        class_,
        rarity,
        level,
        strength,
        max.strength,
        agility,
        max.agility,
        vitality,
        max.vitality,
        endurance,
        max.endurance,
        intelligence,
        max.intelligence,
        will,
        max.will,
        total,
        maxTotal,
      ].map<string>(
        (stat) => `"trait_type": "${stat.name}", "value": "${stat.value}"`
      );

      const bytes = Bytes.fromUTF8(`
      {
        "name": "${token.name}",
        "description": "",
        "image": "${image}",
        "attributes": [{${attributes.join("},{")}}]
      }
    `);

      const data = json.fromBytes(bytes).toObject();

      if (data) {
        updateTokenMetadata(collection, token, data, timestamp);
      } else {
        collection._missingMetadataTokens =
          collection._missingMetadataTokens.concat([token.id]);
      }
    }
  }
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const transfer = new common.TransferEvent(
    event.address,
    params.tokenId,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, fetchTokenMetadata);
}

export function handleAttributeChange(event: AttributeChange): void {
  const params = event.params;
  const collection = getOrCreateCollection(TALES_OF_ELLERIA_ADDRESS);
  const token = getOrCreateToken(collection, params.tokenId);

  let attributes = token.attributes;
  let changed = 0;

  const values = [
    params.strength,
    params.agility,
    params.vitality,
    params.endurance,
    params.intelligence,
    params.will,
  ].reduce((total, value) => total.plus(value), BigInt.zero());

  const existing = new TypedMap<string, string>();
  const stats = [
    new Stat("Strength", params.strength.toString()),
    new Stat("Agility", params.agility.toString()),
    new Stat("Vitality", params.vitality.toString()),
    new Stat("Endurance", params.endurance.toString()),
    new Stat("Intelligence", params.intelligence.toString()),
    new Stat("Will", params.will.toString()),
    new Stat("Total Stats", values.toString()),
  ];

  for (let index = 0; index < attributes.length; index++) {
    const attribute = attributes[index];
    const parts = attribute.split("-");

    existing.set(parts[1], index.toString());
  }

  for (let index = 0; index < stats.length; index++) {
    const stat = stats[index];
    const attributeId = getAttributeId(collection, stat.name, stat.value);

    // No change
    if (attributes.indexOf(attributeId) > -1) {
      continue;
    }

    const existingAttributeIndexString = existing.get(stat.name.toLowerCase());

    if (!existingAttributeIndexString) {
      continue;
    }

    const existingAttributeIndex = parseInt(
      existingAttributeIndexString as string
    ) as i32;

    if (existingAttributeIndex == -1) {
      continue;
    }

    changed++;

    attributes = attributes
      .slice(0, existingAttributeIndex)
      .concat([attributeId])
      .concat(attributes.slice(existingAttributeIndex + 1));

    getOrCreateAttribute(collection, token, stat.name, stat.value).save();
  }

  if (changed > 0) {
    log.warning("{} attributes changed for token {}", [
      changed.toString(),
      params.tokenId.toString(),
    ]);

    token.attributes = attributes;
    token.save();

    updateAttributePercentages(collection);
  }
}

export function handleLevelChange(event: LevelChange): void {
  const params = event.params;
  const collection = getOrCreateCollection(TALES_OF_ELLERIA_ADDRESS);
  const token = getOrCreateToken(collection, params.tokenId);
  const attribute = getOrCreateAttribute(
    collection,
    token,
    "Level",
    params.level.toString()
  );

  token.attributes = token.attributes
    .filter((attribute) => !attribute.includes("-level-"))
    .concat([attribute.id]);

  attribute.save();
  token.save();

  updateAttributePercentages(collection);
}
