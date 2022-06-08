import { newMockEvent } from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_BUYER_ADDRESS,
  TALES_OF_ELLERIA_DATA_ADDRESS,
} from "@treasure/constants";

import { LegionCreated } from "../generated/Legion Metadata Store/LegionMetadataStore";
import { UpdateCollectionOwnerFee } from "../generated/TreasureMarketplace v2/Marketplace";
import { Transfer } from "../generated/TreasureMarketplace/ERC721";
import {
  TransferBatch,
  TransferSingle,
} from "../generated/TreasureMarketplace/ERC1155";
import {
  Staked,
  Unstaked,
} from "../generated/TreasureMarketplace/NonEscrowStaking";
import {
  ItemCanceled,
  ItemListed,
  ItemSold,
  ItemUpdated,
  UpdateOracle,
} from "../generated/TreasureMarketplace/TreasureMarketplace";

export const LEGION_METADATA_STORE_ADDRESS =
  "0x99193EE9229b833d2aA4DbBdA697C6600b944286";

export const createItemCanceledEvent = (
  user: string,
  contract: Address,
  tokenId: i32
): ItemCanceled => {
  const newEvent = changetype<ItemCanceled>(newMockEvent());
  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.parameters = [
    new ethereum.EventParam(
      "seller",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("nftAddress", ethereum.Value.fromAddress(contract)),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};

export const createItemListedEvent = (
  user: string,
  contract: Address,
  tokenId: i32,
  quantity: i32,
  price: i32,
  expires: i32 = 1656403681,
  timestamp: i32 = expires
): ItemListed => {
  const newEvent = changetype<ItemListed>(newMockEvent());
  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.block.timestamp = BigInt.fromI32(timestamp);
  newEvent.parameters = [
    new ethereum.EventParam(
      "seller",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("nftAddress", ethereum.Value.fromAddress(contract)),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("quantity", ethereum.Value.fromI32(quantity)),
    new ethereum.EventParam("pricePerItem", ethereum.Value.fromI32(price)),
    new ethereum.EventParam("expirationTime", ethereum.Value.fromI32(expires)),
  ];

  return newEvent;
};

export const createItemSoldEvent = (
  seller: string,
  buyer: string,
  contract: Address,
  tokenId: i32,
  quantity: i32,
  price: i32
): ItemSold => {
  const newEvent = changetype<ItemSold>(newMockEvent());
  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.transaction.from = Address.fromString(buyer);
  newEvent.parameters = [
    new ethereum.EventParam(
      "seller",
      ethereum.Value.fromAddress(Address.fromString(seller))
    ),
    new ethereum.EventParam(
      "buyer",
      ethereum.Value.fromAddress(MARKETPLACE_BUYER_ADDRESS)
    ),
    new ethereum.EventParam("nftAddress", ethereum.Value.fromAddress(contract)),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("quantity", ethereum.Value.fromI32(quantity)),
    new ethereum.EventParam("pricePerItem", ethereum.Value.fromI32(price)),
  ];

  return newEvent;
};

export const createItemUpdatedEvent = (
  user: string,
  contract: Address,
  tokenId: i32,
  quantity: i32,
  price: i32,
  expires: i32 = 1656403681,
  timestamp: i32 = expires
): ItemUpdated => {
  const newEvent = changetype<ItemUpdated>(newMockEvent());
  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.block.timestamp = BigInt.fromI32(timestamp);
  newEvent.parameters = [
    new ethereum.EventParam(
      "seller",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("nftAddress", ethereum.Value.fromAddress(contract)),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("quantity", ethereum.Value.fromI32(quantity)),
    new ethereum.EventParam("pricePerItem", ethereum.Value.fromI32(price)),
    new ethereum.EventParam("expirationTime", ethereum.Value.fromI32(expires)),
  ];

  return newEvent;
};

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

export const createTransferEvent = (
  contract: Address,
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const newEvent = changetype<Transfer>(newMockEvent());
  newEvent.address = contract;
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

export const createTransferBatchEvent = (
  contract: Address,
  from: string,
  to: string,
  tokenIds: i32[],
  quantities: i32[],
  operator: Address = contract
): TransferBatch => {
  const newEvent = changetype<TransferBatch>(newMockEvent());
  newEvent.address = contract;
  newEvent.parameters = [
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator)),
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("ids", ethereum.Value.fromI32Array(tokenIds)),
    new ethereum.EventParam("values", ethereum.Value.fromI32Array(quantities)),
  ];

  return newEvent;
};

export const createTransferSingleEvent = (
  contract: Address,
  from: string,
  to: string,
  tokenId: i32,
  quantity: i32 = 1,
  operator: Address = contract
): TransferSingle => {
  const newEvent = changetype<TransferSingle>(newMockEvent());
  newEvent.address = contract;
  newEvent.parameters = [
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator)),
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("id", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("value", ethereum.Value.fromI32(quantity)),
  ];

  return newEvent;
};

export const createUpdateOracleEvent = (
  oracle: Address = Address.zero()
): UpdateOracle => {
  const newEvent = changetype<UpdateOracle>(newMockEvent());

  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.parameters = [
    new ethereum.EventParam("oracle", ethereum.Value.fromAddress(oracle)),
  ];

  return newEvent;
};

export const createUpdateCollectionOwnerFee = (
  collection: Address,
  fee: i32
): UpdateCollectionOwnerFee => {
  const newEvent = changetype<UpdateCollectionOwnerFee>(newMockEvent());

  newEvent.address = MARKETPLACE_ADDRESS;
  newEvent.parameters = [
    new ethereum.EventParam(
      "collection",
      ethereum.Value.fromAddress(collection)
    ),
    new ethereum.EventParam(
      "recipient",
      ethereum.Value.fromAddress(Address.zero())
    ),
    new ethereum.EventParam("fee", ethereum.Value.fromI32(fee)),
  ];

  return newEvent;
};

export const createStakedEvent = (user: string, tokenId: i32): Staked => {
  const newEvent = changetype<Staked>(newMockEvent());

  newEvent.address = TALES_OF_ELLERIA_DATA_ADDRESS;
  newEvent.transaction.from = Address.fromString(user);
  newEvent.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};

export const createUnstakedEvent = (user: string, tokenId: i32): Unstaked => {
  const newEvent = changetype<Unstaked>(newMockEvent());

  newEvent.address = TALES_OF_ELLERIA_DATA_ADDRESS;
  newEvent.transaction.from = Address.fromString(user);
  newEvent.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};
