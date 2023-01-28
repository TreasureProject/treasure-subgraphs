import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Treasure/ERC1155";
import { Token, TreasureInfo, User } from "../../generated/schema";
import { getAddressId, isMint } from "../helpers";
import * as common from "../mapping";

// @ts-ignore - i32 undefined
function getBoost(tokenId: i32): number {
  switch (tokenId) {
    case 39: // Ancient Relic 7.5%
      return 75e15;
    case 46: // Bag of Rare Mushrooms 6.2%
      return 62e15;
    case 47: // Bait for Monsters 7.3%
      return 73e15;
    case 48: // Beetle-wing 0.8%
      return 8e15;
    case 49: // Blue Rupee 1.5%
      return 15e15;
    case 51: // Bottomless Elixir 7.6%
      return 76e15;
    case 52: // Cap of Invisibility 7.6%
      return 76e15;
    case 53: // Carriage 6.1%
      return 61e15;
    case 54: // Castle 7.3%
      return 71e15;
    case 68: // Common Bead 5.6%
      return 56e15;
    case 69: // Common Feather 3.4%
      return 34e15;
    case 71: // Common Relic 2.2%
      return 22e15;
    case 72: // Cow 5.8%
      return 58e15;
    case 73: // Diamond 0.8%
      return 8e15;
    case 74: // Divine Hourglass 6.3%
      return 63e15;
    case 75: // Divine Mask 5.7%
      return 57e15;
    case 76: // Donkey 1.2%
      return 12e15;
    case 77: // Dragon Tail 0.8%
      return 8e15;
    case 79: // Emerald 0.8%
      return 8e15;
    case 82: // Favor from the Gods 5.6%
      return 56e15;
    case 91: // Framed Butterfly 5.8%
      return 58e15;
    case 92: // Gold Coin 0.8%
      return 8e15;
    case 93: // Grain 3.2%
      return 32e15;
    case 94: // Green Rupee 3.3%
      return 33e15;
    case 95: // Grin 15.7%
      return 157e15;
    case 96: // Half-Penny 0.8%
      return 8e15;
    case 97: // Honeycomb 15.8%
      return 158e15;
    case 98: // Immovable Stone 7.2%
      return 72e15;
    case 99: // Ivory Breastpin 6.4%
      return 64e15;
    case 100: // Jar of Fairies 5.3%
      return 53e15;
    case 103: // Lumber 3%
      return 30e15;
    case 104: // Military Stipend 6.2%
      return 62e15;
    case 105: // Mollusk Shell 6.7%
      return 67e15;
    case 114: // Ox 1.6%
      return 16e15;
    case 115: // Pearl 0.8%
      return 8e15;
    case 116: // Pot of Gold 5.8%
      return 58e15;
    case 117: // Quarter-Penny 0.8%
      return 8e15;
    case 132: // Red Feather 6.4%
      return 64e15;
    case 133: // Red Rupee 0.8%
      return 8e15;
    case 141: // Score of Ivory 6%
      return 60e15;
    case 151: // Silver Coin 0.8%
      return 8e15;
    case 152: // Small Bird 6%
      return 60e15;
    case 153: // Snow White Feather 6.4%
      return 64e15;
    case 161: // Thread of Divine Silk 7.3%
      return 73e15;
    case 162: // Unbreakable Pocketwatch 5.9%
      return 59e15;
    case 164: // Witches Broom 5.1%
      return 51e15;
    default:
      return 0;
  }
}

// @ts-ignore - i32 undefined
function getCategory(tokenId: i32): string {
  switch (true) {
    case [54, 99, 141, 68, 94, 73, 79].includes(tokenId):
      return "Alchemy";
    case [95, 161, 74, 162, 75, 71, 115].includes(tokenId):
      return "Arcana";
    case [39, 47, 132, 82, 164, 93, 77, 48].includes(tokenId):
      return "Brewing";
    case [51, 98, 153, 91, 100, 69, 49, 151].includes(tokenId):
      return "Enchanting";
    case [97, 105, 46, 152, 72, 76, 96, 117].includes(tokenId):
      return "Leatherworking";
    case [52, 104, 53, 116, 103, 114, 133, 92].includes(tokenId):
      return "Smithing";
    default:
      log.error("Unhandled treasure category: {}", [tokenId.toString()]);

      return "";
  }
}

// @ts-ignore - i32 undefined
function getTier(tokenId: i32): i32 {
  switch (true) {
    case [54, 95, 39, 51, 97, 52].includes(tokenId):
      return 1;
    case [99, 161, 74, 47, 132, 98, 153, 105, 46, 104, 53].includes(tokenId):
      return 2;
    case [141, 68, 162, 75, 82, 91, 100, 152, 72, 116].includes(tokenId):
      return 3;
    case [94, 71, 164, 93, 69, 49, 76, 103, 114].includes(tokenId):
      return 4;
    case [73, 79, 115, 77, 48, 151, 96, 117, 133, 92].includes(tokenId):
      return 5;
    default:
      log.error("Unhandled treasure tier: {}", [tokenId.toString()]);

      return 0;
  }
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("[treasure-metadata] Unknown token: {}", [tokenId.toString()]);

    return;
  }

  let metadata = new TreasureInfo(`${token.id}-metadata`);
  let boostAmount = getBoost(tokenId.toI32());

  if (boostAmount > 0) {
    metadata.boost = `${boostAmount / 1e18}`;
  }

  metadata.category = getCategory(tokenId.toI32());
  metadata.tier = getTier(tokenId.toI32());

  metadata.save();

  token.category = "Treasure";
  token.metadata = metadata.id;

  token.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];
    let value = params.values[index];

    if (getTier(id.toI32()) == 0) {
      continue;
    }

    common.handleTransfer(event.address, params.from, params.to, id, value);

    if (isMint(params.from)) {
      setMetadata(event.address, id);
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  if (getTier(params.id.toI32()) == 0) {
    return;
  }

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value
  );

  if (isMint(params.from)) {
    setMetadata(event.address, params.id);
  }
}
