import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Legacy Legion/ERC1155";
import { Token } from "../../generated/schema";
import { LEGION_IPFS, LEGION_PFP_IPFS } from "../helpers";
import { getLegacyLegionImage } from "../helpers/legion";
import * as common from "../mapping";

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(`${contract.toHexString()}-${tokenId.toHexString()}`);

  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);

    return;
  }

  token.generation = 1;
  token.image = getLegacyLegionImage(LEGION_IPFS, tokenId);
  token.imageAlt = getLegacyLegionImage(LEGION_PFP_IPFS, tokenId);
  token.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];
    let value = params.values[index];

    common.handleTransfer(event.address, params.from, params.to, id, value);

    setMetadata(event.address, id);
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value
  );

  setMetadata(event.address, params.id);
}
