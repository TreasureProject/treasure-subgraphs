import { newMockEvent } from "matchstick-as/assembly";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { LEGION_METADATA_STORE_ADDRESS } from ".";
import {
  LegionCraftLevelUp,
  LegionCreated,
  LegionQuestLevelUp,
} from "../../generated/Legion Metadata Store/LegionMetadataStore";
import { Transfer } from "../../generated/Legion/ERC721";
import { createTransferEvent } from "./transfer";

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

export const createLegionCraftLevelUpEvent = (
  tokenId: i32,
  level: i32
): LegionCraftLevelUp => {
  const newEvent = changetype<LegionCraftLevelUp>(newMockEvent());
  newEvent.address = Address.fromString(LEGION_METADATA_STORE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_craftLevel", ethereum.Value.fromI32(level)),
  ];

  return newEvent;
};

export const createLegionQuestLevelUpEvent = (
  tokenId: i32,
  level: i32
): LegionQuestLevelUp => {
  const newEvent = changetype<LegionQuestLevelUp>(newMockEvent());
  newEvent.address = Address.fromString(LEGION_METADATA_STORE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_questLevel", ethereum.Value.fromI32(level)),
  ];

  return newEvent;
};

export const createLegionTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const newEvent = createTransferEvent(from, to, tokenId);
  newEvent.address = LEGION_ADDRESS;

  return newEvent;
};
