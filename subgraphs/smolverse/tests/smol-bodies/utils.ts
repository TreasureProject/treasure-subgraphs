import { newMockEvent } from "matchstick-as/assembly/index";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { SMOL_BODIES_ADDRESS } from "@treasure/constants";

import {
  BaseURIChanged,
  Transfer,
} from "../../generated/Smol Bodies/ERC721WithBaseUri";

export function createBaseUriChangedEvent(
  from: string,
  to: string
): BaseURIChanged {
  const event = changetype<BaseURIChanged>(newMockEvent());
  event.address = Address.zero();
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromString(from)),
    new ethereum.EventParam("to", ethereum.Value.fromString(to)),
  ];

  return event;
}

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = SMOL_BODIES_ADDRESS;
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return event;
};
