import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { CraftingFinished, CraftingRevealed, CraftingStarted } from "../../generated/Crafting/Crafting";
import { ZERO_BI } from "../../src/helpers/constants";

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

export function createCraftingRevealedEvent(
  timestamp: i32,
  user: string,
  tokenId: i32,
  success: boolean = true,
  magicReturned: BigInt = ZERO_BI,
  rewardId: i32 = 1,
  brokenTreasures: i32[] = [],
  brokenAmounts: i32[] = [],
  rewardAmount: i32 = 1
): CraftingRevealed {
  const event = changetype<CraftingRevealed>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam(
      "_outcome",
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromBoolean(success),
          ethereum.Value.fromUnsignedBigInt(magicReturned),
          ethereum.Value.fromI32(rewardId),
          ethereum.Value.fromI32Array(brokenTreasures),
          ethereum.Value.fromI32Array(brokenAmounts),
          ethereum.Value.fromI32(rewardAmount),
        ])
      )
    ),
  ];

  return event;
};

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
