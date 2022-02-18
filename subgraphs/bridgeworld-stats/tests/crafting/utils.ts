import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { CraftingFinished, CraftingStarted } from "../../generated/Crafting/Crafting";

export function createCraftingStartedEvent(
  timestamp: i32,
  owner: string,
  tokenId: i32
): CraftingStarted {
  const event = changetype<CraftingStarted>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId))
  ];

  return event;
}

export function createCraftingFinishedEvent(
  timestamp: i32,
  owner: string,
  tokenId: i32
): CraftingFinished {
  const event = changetype<CraftingFinished>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId))
  ];

  return event;
}
