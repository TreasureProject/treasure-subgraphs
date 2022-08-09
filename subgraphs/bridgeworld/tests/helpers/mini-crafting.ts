import { newMockEvent } from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { CraftingFinished } from "../../generated/Mini Crafting/MiniCrafting";
import { MINI_CRAFTING_ADDRESS } from "./constants";

export const createMiniCraftingFinishedEvent = (
  timestamp: string,
  user: string,
  tokenId: i32,
  rewardTier: i32,
  rewardId: i32,
  xpGained: i32 = 0
): CraftingFinished => {
  const event = changetype<CraftingFinished>(newMockEvent());
  event.address = Address.fromString(MINI_CRAFTING_ADDRESS);
  event.block.timestamp = BigInt.fromString(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_legionId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_tier", ethereum.Value.fromI32(rewardTier)),
    new ethereum.EventParam("_cpGained", ethereum.Value.fromI32(xpGained)),
    new ethereum.EventParam("_treasureId", ethereum.Value.fromI32(rewardId)),
  ];

  return event;
};
