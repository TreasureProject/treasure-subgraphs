import { newMockEvent } from "matchstick-as/assembly";
import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  CraftingFinished,
  CraftingRevealed,
  CraftingStarted,
} from "../../generated/Crafting/Crafting";
import { CRAFTING_ADDRESS } from ".";

export const createCraftingStartedEvent = (
  user: string,
  tokenId: i32,
  requestId: i32,
  treasures: i32[] = [95],
  amounts: i32[] = [1]
): CraftingStarted => {
  const newEvent = changetype<CraftingStarted>(newMockEvent());
  newEvent.address = Address.fromString(CRAFTING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_finishTime", ethereum.Value.fromI32(0)),
    new ethereum.EventParam(
      "_treasureIds",
      ethereum.Value.fromI32Array(treasures)
    ),
    new ethereum.EventParam(
      "_treasureAmounts",
      ethereum.Value.fromI32Array(amounts)
    ),
  ];

  return newEvent;
};

/*
  get wasSuccessful(): boolean {
    return this[0].toBoolean();
  }

  get magicReturned(): BigInt {
    return this[1].toBigInt();
  }

  get rewardId(): BigInt {
    return this[2].toBigInt();
  }

  get brokenTreasureIds(): Array<BigInt> {
    return this[3].toBigIntArray();
  }

  get brokenAmounts(): Array<BigInt> {
    return this[4].toBigIntArray();
  }

  get rewardAmount(): i32 {
    return this[5].toI32();
  }
*/

export const createCraftingRevealedEvent = (
  user: string,
  tokenId: i32,
  success: boolean = true,
  magicReturned: i32 = 0,
  rewardId: i32 = 1,
  brokenTreasures: i32[] = [],
  brokenAmounts: i32[] = [],
  rewardAmount: i32 = 1
): CraftingRevealed => {
  const newEvent = changetype<CraftingRevealed>(newMockEvent());
  newEvent.address = Address.fromString(CRAFTING_ADDRESS);
  newEvent.parameters = [
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
          ethereum.Value.fromI32(magicReturned),
          ethereum.Value.fromI32(rewardId),
          ethereum.Value.fromI32Array(brokenTreasures),
          ethereum.Value.fromI32Array(brokenAmounts),
          ethereum.Value.fromI32(rewardAmount),
        ])
      )
    ),
  ];

  return newEvent;
};

export const createCraftingFinishedEvent = (
  user: string,
  tokenId: i32
): CraftingFinished => {
  const newEvent = changetype<CraftingFinished>(newMockEvent());
  newEvent.address = Address.fromString(CRAFTING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};
