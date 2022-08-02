import { newMockEvent } from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  LEGACY_LEGION_GENESIS_ADDRESS,
  LEGION_ADDRESS,
} from "@treasure/constants";

import { LEGION_METADATA_STORE_ADDRESS } from ".";
import { TransferSingle } from "../../generated/Legacy Legion Genesis/ERC1155";
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
  level: i32,
  blockNumber: i32 = 0
): LegionQuestLevelUp => {
  const newEvent = changetype<LegionQuestLevelUp>(newMockEvent());
  if (blockNumber > 0) {
    newEvent.block.number = BigInt.fromI32(blockNumber);
  }
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

export const createLegacyLegionGenesisTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): TransferSingle => {
  const event = changetype<TransferSingle>(newMockEvent());
  event.address = LEGACY_LEGION_GENESIS_ADDRESS;
  event.parameters = [
    new ethereum.EventParam(
      "operator",
      ethereum.Value.fromAddress(LEGACY_LEGION_GENESIS_ADDRESS)
    ),
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("id", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("value", ethereum.Value.fromI32(1)),
  ];

  return event;
};
