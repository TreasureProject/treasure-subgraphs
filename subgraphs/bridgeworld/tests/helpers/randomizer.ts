import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";

export const createRandomRequestEvent = (
  requestId: i32,
  commitId: i32
): RandomRequest => {
  const event = changetype<RandomRequest>(newMockEvent());
  event.address = Address.zero();
  event.parameters = [
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_commitId", ethereum.Value.fromI32(commitId)),
  ];
  event.block.timestamp = BigInt.fromI32(1645060164);

  return event;
};

export const createRandomSeededEvent = (commitId: i32): RandomSeeded => {
  const event = changetype<RandomSeeded>(newMockEvent());
  event.address = Address.zero();
  event.parameters = [
    new ethereum.EventParam("_commitId", ethereum.Value.fromI32(commitId)),
  ];

  return event;
};
