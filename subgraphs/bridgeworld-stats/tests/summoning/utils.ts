import { newMockEvent } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";

export function createSummoningStartedEvent(
  timestamp: i32,
  user: string,
  tokenId: i32
): SummoningStarted {
  const event = changetype<SummoningStarted>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return event;
}

export function createSummoningFinishedEvent(
  timestamp: i32,
  user: string,
  returnedId: i32,
  newTokenId: i32
): SummoningFinished {
  const event = changetype<SummoningFinished>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("returnedId", ethereum.Value.fromI32(returnedId)),
    new ethereum.EventParam("newTokenId", ethereum.Value.fromI32(newTokenId)),
  ];

  return event;
}
