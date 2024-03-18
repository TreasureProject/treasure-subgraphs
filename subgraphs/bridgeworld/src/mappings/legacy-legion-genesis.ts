import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Legacy Legion Genesis/ERC1155";
import { LEGION_IPFS, LEGION_PFP_IPFS } from "../helpers/constants";
import { getLegacyGenesisLegionImage } from "../helpers/legion";
import { getOrCreateToken } from "../helpers/token";
import * as common from "../mapping";

function setMetadata(contract: Address, tokenId: BigInt): void {
  const token = getOrCreateToken(contract, tokenId);
  if (!token) {
    log.error("Unknown token: {}", [tokenId.toString()]);
    return;
  }

  token.generation = 0;
  token.image = getLegacyGenesisLegionImage(LEGION_IPFS, tokenId, token.rarity);
  token.imageAlt = getLegacyGenesisLegionImage(
    LEGION_PFP_IPFS,
    tokenId,
    token.rarity
  );
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
