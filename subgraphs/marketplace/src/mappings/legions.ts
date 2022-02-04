import * as common from "../mapping";
import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { LegionCreated } from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { createLegionsCollection, getAddressId } from "../helpers";
import { Token } from "../../generated/schema";
import { BigInt, log, store } from "@graphprotocol/graph-ts";
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

export function handleLegionCreated(event: LegionCreated): void {
  let params = event.params;
  let tokenId = params._tokenId;
  let token = Token.load(getLegionId(tokenId));

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let generation = params._generation;

  // Recruits won't be in the marketplace or user's inventory
  if (generation == 2) {
    store.remove("UserToken", `${params._owner.toHexString()}-${token.id}`);

    token.collection = `${LEGION_ADDRESS.toHexString()}-1`;
    token.name = "Recruit";
    token.save();

    return;
  }

  // Update to faux collection
  token.collection = `${LEGION_ADDRESS.toHexString()}-${generation}`;
  token.name = `${TYPE[generation]} ${RARITY[params._rarity]}`;
  token.save();
}

export function handleTransfer(event: Transfer): void {
  createLegionsCollection(event.address, "Legions Genesis", 0);
  createLegionsCollection(event.address, "Legions Auxiliary", 1);

  common.handleTransfer721(event);
}
