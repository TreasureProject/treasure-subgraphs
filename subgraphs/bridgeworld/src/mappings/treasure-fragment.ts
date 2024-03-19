import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Treasure Fragment/ERC1155";
import { Token, TreasureFragmentInfo } from "../../generated/schema";
import { TREASURE_FRAGMENT_IPFS, getAddressId, isMint } from "../helpers";
import * as common from "../mapping";

function getRomanNumerals(num: i32): string {
  switch (num) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
      return "IV";
    case 5:
      return "V";
    default:
      return "";
  }
}

function getCategories(tokenId: i32): string[] {
  switch (tokenId) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return ["Alchemy", "Arcana"];
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return ["Brewing", "Enchanting"];
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
      return ["Leatherworking", "Smithing"];
    default:
      log.error("Unhandled treasure fragment category: {}", [
        tokenId.toString(),
      ]);

      return [];
  }
}

function getTier(tokenId: i32): i32 {
  switch (tokenId) {
    case 1:
    case 6:
    case 11:
      return 1;
    case 2:
    case 7:
    case 12:
      return 2;
    case 3:
    case 8:
    case 13:
      return 3;
    case 4:
    case 9:
    case 14:
      return 4;
    case 5:
    case 10:
    case 15:
      return 5;
    default:
      log.error("Unhandled treasure fragment tier: {}", [tokenId.toString()]);

      return 0;
  }
}

function getName(tokenId: i32): string {
  return (
    getCategories(tokenId).join(" & ") +
    " " +
    getRomanNumerals(getTier(tokenId))
  );
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("[treasure-fragment-metadata] Unknown token: {}", [
      tokenId.toString(),
    ]);

    return;
  }

  let metadata = new TreasureFragmentInfo(`${token.id}-metadata`);

  metadata.categories = getCategories(tokenId.toI32());
  metadata.tier = getTier(tokenId.toI32());

  metadata.save();

  token.category = "TreasureFragment";
  token.metadata = metadata.id;
  token.name = getName(token.tokenId.toI32());
  token.image = `${TREASURE_FRAGMENT_IPFS}/${token.tokenId}.jpg`;

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
