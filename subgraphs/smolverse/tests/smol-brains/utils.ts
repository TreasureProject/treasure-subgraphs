import { Address, ethereum } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { newMockEvent } from "matchstick-as/assembly/index";

import { Transfer } from "../../generated/Smol Brains/SmolBrains";

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = SMOL_BRAINS_ADDRESS;
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))
  ];

  return event;
}
