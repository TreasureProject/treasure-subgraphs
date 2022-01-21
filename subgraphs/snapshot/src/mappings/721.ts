import * as common from "../mapping";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Collection } from "../../generated/schema";
import { isMint } from "../helpers";

class Transfer__Params {
  from: Address;
  to: Address;
  tokenId: BigInt;
}

class Transfer {
  address: Address;
  params: Transfer__Params;
}

export function handleTransfer<Event extends Transfer>(
  event: Event,
  name: string
): void {
  let params = event.params;

  if (
    isMint(params.from) &&
    // Have to include 1 because Smol Cars starts from 1 instead of 0
    [BigInt.zero(), BigInt.fromI32(1)].includes(params.tokenId)
  ) {
    let collection = new Collection(event.address.toHexString());

    collection.name = name;
    collection.save();
  }

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.tokenId,
    BigInt.fromI32(1)
  );
}
