import { newMockEvent } from "matchstick-as";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  FinishedUnstakingTreasure,
  LifeformCreated,
} from "../../generated/SeedEvolution/SeedEvolution";
import { USER_ADDRESS } from "../utils";

export function createLifeformCreatedEvent(
  lifeformId: i32,
  firstRealm: i32,
  secondRealm: i32,
  path: i32,
  stakedTreasureIds: i32[] = [],
  stakedTreasureAmounts: i32[] = [],
  owner: string = USER_ADDRESS,
  requestId: i32 = 1
): LifeformCreated {
  const event = changetype<LifeformCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("_lifeformId", ethereum.Value.fromI32(lifeformId)),
    new ethereum.EventParam(
      "_evolutionInfo",
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromI32(0), // startTime
          ethereum.Value.fromI32(requestId),
          ethereum.Value.fromAddress(Address.fromString(owner)),
          ethereum.Value.fromI32(path),
          ethereum.Value.fromI32(firstRealm),
          ethereum.Value.fromI32(secondRealm),
          ethereum.Value.fromI32(0), // treasureBoost
          ethereum.Value.fromI32(0), // unstakingRequestId
          ethereum.Value.fromI32Array(stakedTreasureIds),
          ethereum.Value.fromI32Array(stakedTreasureAmounts),
        ])
      )
    ),
  ];

  return event;
}

export function createFinishedUnstakingTreasureEvent(
  unstakingTreasureIds: i32[] = [],
  unstakingTreasureAmounts: i32[] = [],
  owner: string = USER_ADDRESS
): FinishedUnstakingTreasure {
  const event = changetype<FinishedUnstakingTreasure>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(owner))
    ),
    new ethereum.EventParam(
      "_unstakingTreasureIds",
      ethereum.Value.fromI32Array(unstakingTreasureIds)
    ),
    new ethereum.EventParam(
      "_unstakingTreasureAmounts",
      ethereum.Value.fromI32Array(unstakingTreasureAmounts)
    ),
  ];
  return event;
}
