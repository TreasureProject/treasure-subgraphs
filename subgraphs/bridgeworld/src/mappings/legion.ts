import * as common from "../mapping";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import {
  LegionConstellationRankUp,
  LegionCraftLevelUp,
  LegionCreated,
  LegionQuestLevelUp,
} from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { Constellation, LegionInfo, Token } from "../../generated/schema";
import { Transfer } from "../../generated/Legion/ERC721";
import { getImageHash, isMint } from "../helpers";

enum Rarity {
  Legendary,
  Rare,
  Special,
  Uncommon,
  Common,
  Recruit,
}

enum Class {
  Recruit,
  Siege,
  Fighter,
  Assassin,
  Ranged,
  Spellcaster,
  Riverman,
  Numeraire,
  AllClass,
  Origin,
}

enum Type {
  Genesis,
  Auxiliary,
  Recruit,
}

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

function getLegionId(tokenId: BigInt): string {
  return `${LEGION_ADDRESS.toHexString()}-${tokenId.toHexString()}`;
}

function getLegionName(legion: LegionInfo): string {
  return `${legion.type} ${legion.rarity}`.replace(
    "Recruit Recruit",
    "Recruit"
  );
  // let prefix = legion.type === Type.Genesis ? "Genesis" : "Auxiliary";

  // switch (legion.rarity) {
  //   case Rarity.Legendary:
  //     return `${prefix} Legendary`;
  //   case Rarity.Rare:
  //     return `${prefix} Rare`;
  //   case Rarity.Special:
  //     return `${prefix} Special`;
  //   case Rarity.Uncommon:
  //     return `${prefix} Uncommon`;
  //   case Rarity.Common:
  //     return `${prefix} Common`;
  //   case Rarity.Recruit:
  //     return "Recruit";
  //   default:
  //     throw new Error(`Unhandled legion rarity: ${legion.rarity.toString()}`);
  // }
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
    `${LEGION_ADDRESS.toHexString()}-${tokenId.toHexString()}-metadata`
  );

  if (!metadata) {
    throw new Error(`Metadata not available: ${tokenId.toString()}`);
  }

  return metadata;
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(`${contract.toHexString()}-${tokenId.toHexString()}`);

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let metadata = new LegionInfo(token.id);

  metadata.crafting = 1;
  metadata.questing = 1;
  metadata.rarity = "Legendary";
  metadata.role = "Origin";
  metadata.type = "Genesis";

  metadata.save();

  token.category = "Legion";
  token.image = getImageHash(BigInt.fromI32(55), "Clocksnatcher");
  token.name = "Clocksnatcher";
  token.metadata = metadata.id;

  token.save();
}

export function handleLegionConstellationRankUp(
  event: LegionConstellationRankUp
): void {
  let params = event.params;
  let rank = params._rank;
  let tokenId = params._tokenId;

  let constellation = getConstellation(`${getLegionId(tokenId)}-constellation`);

  log.info("Leveling up constellation {} to {} for {}", [
    params._constellation.toString(),
    rank.toString(),
    tokenId.toString(),
  ]);

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

  metadata.crafting = 1;
  metadata.questing = 1;
  metadata.rarity = RARITY[params._rarity];
  metadata.role = CLASS[params._class];
  metadata.type = TYPE[params._generation];

  metadata.save();

  token.category = "Legion";
  // TODO: Replace
  token.image = getImageHash(BigInt.fromI32(55), "Clocksnatcher");
  token.name = getLegionName(metadata);
  token.metadata = metadata.id;

  token.save();
}

export function handleLegionQuestLevelUp(event: LegionQuestLevelUp): void {
  let params = event.params;
  let metadata = getMetadata(params._tokenId);

  metadata.crafting = params._questLevel;
  metadata.save();
}

export function handleTransfer(event: Transfer): void {
  let params = event.params;

  log.info("bugggy {} {} {}", [
    event.address.toHexString(),
    params.tokenId.toString(),
    params.tokenId.toHexString(),
  ]);

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.tokenId,
    BigInt.fromI32(1)
  );

  // TODO: Not needed in Prod
  if (isMint(params.from) && params.tokenId.toI32() < 4) {
    setMetadata(event.address, params.tokenId);
  }
}
