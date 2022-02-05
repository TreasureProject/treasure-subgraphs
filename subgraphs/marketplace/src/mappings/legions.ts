import * as common from "../mapping";
import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { LegionCreated } from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { createLegionsCollection, getAddressId } from "../helpers";
import { Token } from "../../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";

const RARITY = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "Recruit",
];

const TYPE = ["Genesis", "Auxiliary", "Recruit"];

function getLegionId(tokenId: BigInt): string {
  return getAddressId(LEGION_ADDRESS, tokenId);
}

function getLegionName(tokenId: BigInt, generation: i32): string | null {
  if (generation == 2) {
    return "Recruit";
  }

  switch (tokenId.toI32()) {
    case 523:
      return "Bombmaker";
    case 1629:
      return "Warlock";
    case 1744:
      return "Fallen";
    case 2239:
      return "Dreamwinder";
    case 3476:
      return "Clocksnatcher";
    default:
      return null;
  }
}

export function handleLegionCreated(event: LegionCreated): void {
  let params = event.params;
  let tokenId = params._tokenId;
  let token = Token.load(getLegionId(tokenId));

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let generation = params._generation;

  // Update to faux collection
  token.collection = `${LEGION_ADDRESS.toHexString()}-${generation}`;
  token.name =
    getLegionName(tokenId, generation) ||
    `${TYPE[generation]} ${RARITY[params._rarity]}`;

  token.save();
}

export function handleTransfer(event: Transfer): void {
  createLegionsCollection(event.address, "Legion Genesis", 0);
  createLegionsCollection(event.address, "Legion Auxiliary", 1);
  createLegionsCollection(event.address, "Legions", 2);

  common.handleTransfer721(event);
}
