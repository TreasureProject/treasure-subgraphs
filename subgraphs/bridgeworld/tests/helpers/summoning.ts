import { newMockEvent } from "matchstick-as/assembly";
import { Address, ethereum } from "@graphprotocol/graph-ts";

import { SUMMONING_ADDRESS } from ".";
import { SummoningFinished, SummoningStarted } from "../../generated/Summoning/Summoning";

export const createSummoningStartedEvent = (
  user: string,
  tokenId: i32,
  requestId: i32,
  finishTime: i32
): SummoningStarted => {
  const newEvent = changetype<SummoningStarted>(newMockEvent());
  newEvent.address = Address.fromString(SUMMONING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_finishTime", ethereum.Value.fromI32(finishTime))
  ];

  return newEvent;
};

export const createdSummoningFinishedEvent = (
  user: string,
  returnedId: i32,
  newTokenId: i32,
  newTokenSummoningCooldown: i32
): SummoningFinished => {
  const newEvent = changetype<SummoningFinished>(newMockEvent());
  newEvent.address = Address.fromString(SUMMONING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_returnedId", ethereum.Value.fromI32(returnedId)),
    new ethereum.EventParam("_newTokenId", ethereum.Value.fromI32(newTokenId)),
    new ethereum.EventParam("_newTokenSummoningCooldown", ethereum.Value.fromI32(newTokenSummoningCooldown))
  ];

  return newEvent;
};
