import { Address, BigInt, dataSource, log } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  LegionConstellationRankUp,
  LegionCraftLevelUp,
  LegionCreated,
  LegionQuestLevelUp,
} from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { Transfer } from "../../generated/Legion/ERC721";
import { Constellation, LegionInfo, Token } from "../../generated/schema";
import {
  LEGION_IPFS,
  LEGION_NO_BACKGROUND_IPFS,
  LEGION_PFP_IPFS,
  ZERO_BI,
  getAddressId,
  getImageHash,
  isMint,
} from "../helpers";
import {
  isCraftingXpGainedEnabled,
  isQuestingXpGainedEnabled,
} from "../helpers/config";
import {
  CLASS,
  RARITY,
  TYPE,
  getLegionImage,
  getLegionMetadata,
} from "../helpers/legion";
import { getUser } from "../helpers/user";
import * as common from "../mapping";

const BOOST_MATRIX = [
  // GENESIS
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [600e16, 200e16, 75e16, 100e16, 50e16, 0],
  // AUXILIARY
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [0, 25e16, 0, 10e16, 5e16, 0],
  // RECRUIT
  // LEGENDARY,RARE,SPECIAL,UNCOMMON,COMMON,RECRUIT
  [0, 0, 0, 0, 0, 0],
];

const HARVESTERS_WEIGHT_MATRIX = [
  // Genesis
  [
    BigInt.fromString("120000000000000000000"), // Legendary = 120
    BigInt.fromString("40000000000000000000"), // Rare = 40
    BigInt.fromString("16000000000000000000"), // Special = 16
    BigInt.fromString("21000000000000000000"), // Uncommon = 21
    BigInt.fromString("11000000000000000000"), // Common = 11
    ZERO_BI, // Recruit = N/A
  ],
  // Auxiliary
  [
    ZERO_BI, // Legendary = N/A
    BigInt.fromString("5500000000000000000"), // Rare = 5.5
    ZERO_BI, // Special = N/A
    BigInt.fromString("4000000000000000000"), // Uncommon = 4
    BigInt.fromString("2500000000000000000"), // Common = 2.5
    ZERO_BI, // Recruit = N/A
  ],
  // Recruit
  [ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI],
];

const HARVESTERS_RANK_MATRIX = [
  // Genesis
  [
    BigInt.fromString("4000000000000000000"), // Legendary = 4
    BigInt.fromString("4000000000000000000"), // Rare = 4
    BigInt.fromString("2000000000000000000"), // Special = 2
    BigInt.fromString("3000000000000000000"), // Uncommon = 3
    BigInt.fromString("1500000000000000000"), // Common = 1.5
    ZERO_BI, // Recruit = N/A
  ],
  // Auxiliary
  [
    ZERO_BI, // Legendary = N/A
    BigInt.fromString("1200000000000000000"), // Rare = 1.2
    ZERO_BI, // Special = N/A
    BigInt.fromString("1100000000000000000"), // Uncommon = 1.1
    BigInt.fromString("1000000000000000000"), // Common = 1
    ZERO_BI, // Recruit = N/A
  ],
  // Recruit
  [ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI],
];

function getLegionId(tokenId: BigInt): string {
  return getAddressId(LEGION_ADDRESS, tokenId);
}

function getConstellation(id: string): Constellation {
  let constellation = Constellation.load(id);

  if (!constellation) {
    constellation = new Constellation(id);

    constellation.dark = 0;
    constellation.earth = 0;
    constellation.fire = 0;
    constellation.light = 0;
    constellation.water = 0;
    constellation.wind = 0;

    constellation.save();
  }

  return constellation;
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let metadata = new LegionInfo(`${token.id}-metadata`);

  metadata.boost = `${BOOST_MATRIX[0][0] / 1e18}`;
  metadata.harvestersRank = HARVESTERS_RANK_MATRIX[0][0];
  metadata.harvestersWeight = HARVESTERS_WEIGHT_MATRIX[0][0];
  metadata.constellation = token.id;
  metadata.crafting = 1;
  metadata.craftingXp = 0;
  metadata.majorCraftsCompleted = 0;
  metadata.miniCraftsCompleted = 0;
  metadata.questing = 1;
  metadata.questingXp = 0;
  metadata.questsCompleted = 0;
  metadata.questsDistanceTravelled = 0;
  metadata.recruitLevel = 0;
  metadata.recruitXp = 0;
  metadata.recruitCanAscendToAux = false;
  metadata.rarity = "Legendary";
  metadata.role = "Origin";
  metadata.type = "Genesis";
  metadata.summons = BigInt.zero();

  metadata.save();

  token.category = "Legion";
  token.image = getImageHash(BigInt.fromI32(55), "Clocksnatcher");
  token.name = "Clocksnatcher";
  token.metadata = metadata.id;
  token.rarity = metadata.rarity;

  token.save();
}

export function handleLegionConstellationRankUp(
  event: LegionConstellationRankUp
): void {
  let params = event.params;
  let rank = params._rank;
  let tokenId = params._tokenId;

  let constellation = getConstellation(getLegionId(tokenId));

  switch (params._constellation) {
    case 0:
      constellation.fire = rank;

      break;
    case 1:
      constellation.earth = rank;

      break;
    case 2:
      constellation.wind = rank;

      break;
    case 3:
      constellation.water = rank;

      break;
    case 4:
      constellation.light = rank;

      break;
    case 5:
      constellation.dark = rank;

      break;
    default:
      log.error("Invalid constellation {} for token {}", [
        rank.toString(),
        tokenId.toString(),
      ]);
  }

  constellation.save();
}

export function handleLegionCraftLevelUp(event: LegionCraftLevelUp): void {
  // Prefer the CPGained event if it's available at this block
  if (!isCraftingXpGainedEnabled(event.block.number)) {
    const params = event.params;
    const metadata = getLegionMetadata(params._tokenId);
    metadata.crafting = params._craftLevel;
    metadata.craftingXp = 0;
    metadata.save();
  }
}

export function handleLegionCreated(event: LegionCreated): void {
  const params = event.params;

  const tokenId = params._tokenId;
  const token = Token.load(getLegionId(tokenId));
  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);
    return;
  }

  const generation = params._generation;
  const rarity = params._rarity;
  const type = TYPE[generation];
  const isRecruit = type == "Recruit";
  const metadata = new LegionInfo(`${token.id}-metadata`);
  metadata.boost = `${BOOST_MATRIX[generation][rarity] / 1e18}`;
  metadata.harvestersRank = HARVESTERS_RANK_MATRIX[generation][rarity];
  metadata.harvestersWeight = HARVESTERS_WEIGHT_MATRIX[generation][rarity];
  metadata.constellation = token.id;
  metadata.crafting = 1;
  metadata.craftingXp = 0;
  metadata.majorCraftsCompleted = 0;
  metadata.miniCraftsCompleted = 0;
  metadata.questing = 1;
  metadata.questingXp = 0;
  metadata.questsCompleted = 0;
  metadata.questsDistanceTravelled = 0;
  metadata.recruitLevel = isRecruit ? 1 : 0;
  metadata.recruitXp = 0;
  metadata.recruitCanAscendToAux = false;
  metadata.rarity = isRecruit ? "Recruit" : RARITY[rarity];
  metadata.role = isRecruit ? "Base Recruit" : CLASS[params._class];
  metadata.type = type;
  metadata.summons = BigInt.zero();
  metadata.save();

  token.category = "Legion";
  token.image = getLegionImage(
    LEGION_IPFS,
    metadata.type,
    metadata.rarity,
    metadata.role,
    tokenId
  );
  token.imageAlt = getLegionImage(
    LEGION_PFP_IPFS,
    metadata.type,
    metadata.rarity,
    metadata.role,
    tokenId
  );
  token.imageNoBackground = getLegionImage(
    LEGION_NO_BACKGROUND_IPFS,
    metadata.type,
    metadata.rarity,
    metadata.role,
    tokenId,
    null,
    false
  );

  if (isRecruit) {
    const user = getUser(params._owner.toHexString());
    user.recruit = token.id;
    user.save();

    token.name = metadata.role;
    token.rarity = metadata.rarity;
  } else {
    token.name = `${metadata.type} ${metadata.rarity}`;
    token.rarity = metadata.rarity;
  }

  token.metadata = metadata.id;
  token.generation = generation;
  token.save();
}

export function handleLegionQuestLevelUp(event: LegionQuestLevelUp): void {
  // Prefer the QPGained event if it's available at this block
  if (!isQuestingXpGainedEnabled(event.block.number)) {
    const params = event.params;
    const metadata = getLegionMetadata(params._tokenId);
    metadata.questing = params._questLevel;
    metadata.questingXp = 0;
    metadata.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let params = event.params;

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.tokenId,
    BigInt.fromI32(1)
  );

  // There was an issue in testing that needs us to manually setup metadata for now.
  if (
    dataSource.network() == "arbitrum-goerli" &&
    isMint(params.from) &&
    params.tokenId.toI32() < 4
  ) {
    setMetadata(event.address, params.tokenId);
  }
}
