import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Seed of Life Resources/ERC1155";
import { getOrCreateCollection, getOrCreateToken } from "../helpers/models";

function handleTransfer(address: Address, tokenId: BigInt): void {
  const collection = getOrCreateCollection(address);
  const token = getOrCreateToken(collection, tokenId);

  if (token.name != "") {
    return;
  }

  if (token.tokenId == BigInt.fromI32(1)) {
    token.name = "Skill Reset Potion";
    token.image = "ipfs://QmS3YBo7xCh7h5rmXu96Y6zumjUMWCH43G333HvTeV2qhA";
  } else {
    log.warning("[seed-of-life-resources] Unknown token ID: {}", [
      token.tokenId.toString(),
    ]);

    token.name = `Seed of Life Resource #${token.tokenId.toString()}`;
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
