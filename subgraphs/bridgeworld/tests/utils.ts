import { newMockEvent } from "matchstick-as/assembly";
import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  PilgrimagesStarted,
  PilgrimagesFinished,
} from "../generated/Pilgrimage/Pilgrimage";
import { Transfer } from "../generated/Legion/ERC721";
import { LegionCreated } from "../generated/Legion Metadata Store/LegionMetadataStore";

export const LEGION_ADDRESS = "0xfE8c1ac365bA6780AEc5a985D989b327C27670A1";
export const LEGION_METADATA_STORE_ADDRESS =
  "0x99193EE9229b833d2aA4DbBdA697C6600b944286";
export const PILGRIMAGE_ADDRESS = "0x088613c6bbb951c9796ba3bb42a1f310fb209fbd";

export const createLegionCreatedEvent = (
  user: string,
  tokenId: i32,
  generation: i32,
  role: i32,
  rarity: i32
): LegionCreated => {
  const newEvent = changetype<LegionCreated>(newMockEvent());
  newEvent.address = Address.fromString(LEGION_METADATA_STORE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_generation", ethereum.Value.fromI32(generation)),
    new ethereum.EventParam("_class", ethereum.Value.fromI32(role)),
    new ethereum.EventParam("_rarity", ethereum.Value.fromI32(rarity)),
  ];

  return newEvent;
};

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

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const newEvent = changetype<Transfer>(newMockEvent());
  newEvent.address = Address.fromString(LEGION_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};
