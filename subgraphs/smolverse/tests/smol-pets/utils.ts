import { newMockEvent } from "matchstick-as/assembly/index";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  BaseURIChanged,
  Transfer,
} from "../../generated/Smol Brains Pets/ERC721WithBaseUri";

export const createBaseUriChangedEvent = (
  from: string,
  to: string
): BaseURIChanged => {
  const event = changetype<BaseURIChanged>(newMockEvent());
  event.address = Address.zero();
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromString(from)),
    new ethereum.EventParam("to", ethereum.Value.fromString(to)),
  ];

  return event;
};

export const createTransferEvent = (
  address: string,
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = Address.fromString(address);
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
