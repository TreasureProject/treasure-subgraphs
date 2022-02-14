import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { SummoningFinished, SummoningStarted } from "../../generated/Summoning/Summoning";

export function createSummoningStartedEvent(
  timestamp: i32,
  user: string
): SummoningStarted {
  const event = changetype<SummoningStarted>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam("_user", ethereum.Value.fromAddress(Address.fromString(user)))
  ];

  return event;
}

export function createSummoningFinishedEvent(
  timestamp: i32,
  user: string
): SummoningFinished {
  const event = changetype<SummoningFinished>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam("_user", ethereum.Value.fromAddress(Address.fromString(user)))
  ];

  return event;
}
