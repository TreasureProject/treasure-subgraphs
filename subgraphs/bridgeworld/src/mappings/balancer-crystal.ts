import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/Balancer Crystal/ERC1155";
import { Token } from "../../generated/schema";
import { getAddressId, isMint } from "../helpers";
import * as common from "../mapping";

function getName(tokenId: i32): string {
  switch (tokenId) {
    case 1:
      return "Balancer Crystal";
    default:
      log.error("Unhandled balancer crystal name: {}", [tokenId.toString()]);

      return "";
  }
}

function setMetadata(contract: Address, tokenId: BigInt): void {
  let token = Token.load(getAddressId(contract, tokenId));

  if (!token) {
    log.error("Unknown balancer crystal token: {}", [tokenId.toString()]);

    return;
  }

  token.category = "Crystal";
  token.name = getName(tokenId.toI32());
  token.image = `ipfs://Qmd1hsvPDWrxtnfUna3pQyfmChyAkMenuziHS1gszM34P8/Balancer%20Crystal/${tokenId.toString()}.jpg`;
  token.rarity = "None";

  token.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;

  for (let index = 0; index < params.ids.length; index++) {
    let id = params.ids[index];
    let value = params.values[index];

    common.handleTransfer(event.address, params.from, params.to, id, value);

    if (isMint(params.from)) {
      setMetadata(event.address, id);
    }
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

  if (isMint(params.from)) {
    setMetadata(event.address, params.id);
  }
}
