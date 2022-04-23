import {
  Address,
  BigInt,
  dataSource,
  log,
  store,
} from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  LegionConstellationRankUp,
  LegionCraftLevelUp,
  LegionCreated,
  LegionQuestLevelUp,
} from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { ApprovalForAll, Transfer } from "../../generated/Legion/ERC721";
import {
  Approval,
  Constellation,
  LegionInfo,
  Token,
  User,
  UserApproval,
} from "../../generated/schema";
import { LEGION_IPFS, getAddressId, getImageHash, isMint } from "../helpers";
import * as common from "../mapping";

const RARITY = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "Recruit",
];

const CLASS = [
  "Recruit",
  "Siege",
  "Fighter",
  "Assassin",
  "Ranged",
  "Spellcaster",
  "Riverman",
  "Numeraire",
  "All-Class",
  "Origin",
];

const TYPE = ["Genesis", "Auxiliary", "Recruit"];

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

function getMetadata(tokenId: BigInt): LegionInfo {
  let metadata = LegionInfo.load(
    `${getAddressId(LEGION_ADDRESS, tokenId)}-metadata`
  );

  if (!metadata) {
    throw new Error(`Metadata not available: ${tokenId.toString()}`);
  }

  return metadata;
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let metadata = new LegionInfo(`${token.id}-metadata`);

  metadata.boost = `${BOOST_MATRIX[0][0] / 1e18}`;
  metadata.constellation = token.id;
  metadata.crafting = 1;
  metadata.craftingXp = 0;
  metadata.questing = 1;
  metadata.questingXp = 0;
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

export function handleApprovalForAll(event: ApprovalForAll): void {
  let params = event.params;

  let userId = params.owner.toHexString();
  let user = User.load(userId);

  if (!user) {
    log.error("Unknown user: {}", [userId]);

    return;
  }

  let contract = event.address;
  let operator = params.operator;

  let approvalId = `${contract.toHexString()}-${operator.toHexString()}`;
  let approval = Approval.load(approvalId);

  if (!approval) {
    approval = new Approval(approvalId);

    approval.contract = contract;
    approval.operator = operator;

    approval.save();
  }

  let userApprovalId = `${user.id}-${approval.id}`;

  if (params.approved) {
    let userApproval = new UserApproval(userApprovalId);

    userApproval.approval = approval.id;
    userApproval.user = user.id;

    userApproval.save();
  } else {
    store.remove("UserApproval", userApprovalId);
  }
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
  let params = event.params;
  let metadata = getMetadata(params._tokenId);

  metadata.crafting = params._craftLevel;
  metadata.craftingXp = 0;
  metadata.save();
}

export function handleLegionCreated(event: LegionCreated): void {
  let params = event.params;
  let tokenId = params._tokenId;
  let token = Token.load(getLegionId(tokenId));

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let metadata = new LegionInfo(`${token.id}-metadata`);

  metadata.boost = `${BOOST_MATRIX[params._generation][params._rarity] / 1e18}`;
  metadata.constellation = token.id;
  metadata.crafting = 1;
  metadata.craftingXp = 0;
  metadata.questing = 1;
  metadata.questingXp = 0;
  metadata.rarity = RARITY[params._rarity];
  metadata.role = CLASS[params._class];
  metadata.type = TYPE[params._generation];
  metadata.summons = BigInt.zero();

  metadata.save();

  token.category = "Legion";
  token.image = `${LEGION_IPFS}/${metadata.rarity}%20${metadata.role}.gif`;
  token.name = `${metadata.type} ${metadata.rarity}`;
  token.metadata = metadata.id;
  token.generation = params._generation;
  token.rarity = metadata.rarity.replace("Recruit", "None");

  if (metadata.type == "Recruit") {
    let user = User.load(params._owner.toHexString());

    if (user) {
      user.recruit = token.id;
      user.save();
    }

    token.image = `${LEGION_IPFS}/Recruit.gif`;
    token.name = "Recruit";
  }

  token.save();
}

export function handleLegionQuestLevelUp(event: LegionQuestLevelUp): void {
  let params = event.params;
  let metadata = getMetadata(params._tokenId);

  metadata.questing = params._questLevel;
  metadata.questingXp = 0;
  metadata.save();
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
    dataSource.network() == "arbitrum-rinkeby" &&
    isMint(params.from) &&
    params.tokenId.toI32() < 4
  ) {
    setMetadata(event.address, params.tokenId);
  }
}
