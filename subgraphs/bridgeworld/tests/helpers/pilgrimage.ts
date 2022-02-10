import { newMockEvent } from "matchstick-as/assembly";
import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  PilgrimagesStarted,
  PilgrimagesFinished,
} from "../../generated/Pilgrimage/Pilgrimage";
import { PILGRIMAGE_ADDRESS } from ".";

export const createPilgrimagesStartedEvent = (
  user: string,
  legionContract: string,
  finishTime: i32,
  ids: i32[],
  amounts: i32[],
  pilgrimageIds: i32[]
): PilgrimagesStarted => {
  const newEvent = changetype<PilgrimagesStarted>(newMockEvent());
  newEvent.address = Address.fromString(PILGRIMAGE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam(
      "_legionContract",
      ethereum.Value.fromAddress(Address.fromString(legionContract))
    ),
    new ethereum.EventParam("_finishTime", ethereum.Value.fromI32(finishTime)),
    new ethereum.EventParam("_ids1155", ethereum.Value.fromI32Array(ids)),
    new ethereum.EventParam(
      "_amounts1155",
      ethereum.Value.fromI32Array(amounts)
    ),
    new ethereum.EventParam(
      "_pilgrimageIds",
      ethereum.Value.fromI32Array(pilgrimageIds)
    ),
  ];

  return newEvent;
};

export const createPilgrimagesFinishedEvent = (
  user: string,
  tokenIds: i32[],
  finishedPilgrimageIds: i32[]
): PilgrimagesFinished => {
  const newEvent = changetype<PilgrimagesFinished>(newMockEvent());
  newEvent.address = Address.fromString(PILGRIMAGE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenIds", ethereum.Value.fromI32Array(tokenIds)),
    new ethereum.EventParam(
      "_finishedPilgrimageIds",
      ethereum.Value.fromI32Array(finishedPilgrimageIds)
    ),
  ];

  return newEvent;
};
