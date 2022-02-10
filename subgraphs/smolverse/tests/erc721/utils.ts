import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Transfer } from "../../generated/Smol Brains/ERC721";

export function createTransferEvent(
  collectionAddress: Address,
  to: string,
  tokenId: i32
): Transfer {
  const event = changetype<Transfer>(newMockEvent());
  event.address = collectionAddress;
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.zero())),
    new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))
  ];

  return event;
}
