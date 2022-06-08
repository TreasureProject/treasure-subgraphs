import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Seed of Life Items/ERC1155";
import { getOrCreateCollection, getOrCreateToken } from "../helpers/models";

function handleTransfer(address: Address, tokenId: BigInt): void {
  const collection = getOrCreateCollection(address);
  const token = getOrCreateToken(collection, tokenId);

  if (token.name != "") {
    return;
  }

  if (token.tokenId == BigInt.fromI32(1)) {
    token.name = "Skill Reset Potion";
  } else {
    log.warning("[seed-of-life-item] Unknown token ID: {}", [
      token.tokenId.toString(),
    ]);

    token.name = `Seed of Life Item #${token.tokenId.toString()}`;
  }

  token.save();
}

export function handleTransferSingle(event: TransferSingle): void {
  handleTransfer(event.address, event.params.id);
}

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;
  const ids = params.ids;

  for (let i = 0; i < ids.length; i++) {
    handleTransfer(event.address, ids[i]);
  }
}
