import { newMockEvent } from "matchstick-as/assembly/index";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import {
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";

export const PILGRIMAGE_ADDRESS = "0x088613c6bbb951c9796ba3bb42a1f310fb209fbd";

export const createPilgrimagesStartedEvent = (
  timestamp: i32,
  user: string,
  legionContract: string,
  finishTime: i32,
  ids: i32[],
  amounts: i32[],
  pilgrimageIds: i32[]
): PilgrimagesStarted => {
  const event = changetype<PilgrimagesStarted>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.address = Address.fromString(PILGRIMAGE_ADDRESS);
  event.parameters = [
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

  return event;
};

export const createPilgrimagesFinishedEvent = (
  timestamp: i32,
  user: string,
  tokenids: i32[],
  finishedPilgrimageIds: i32[]
): PilgrimagesFinished => {
  const event = changetype<PilgrimagesFinished>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.address = Address.fromString(PILGRIMAGE_ADDRESS);
  event.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenIds", ethereum.Value.fromI32Array(tokenids)),
    new ethereum.EventParam(
      "_finishedPilgrimageIds",
      ethereum.Value.fromI32Array(finishedPilgrimageIds)
    ),
  ];

  return event;
};
