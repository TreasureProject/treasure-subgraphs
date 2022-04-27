import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_BUYER_ADDRESS,
  SMOL_TREASURES_ADDRESS,
} from "@treasure/constants";

import { handleItemListed, handleItemSold } from "../src/mapping";
import {
  handleTransferBatch,
  handleTransferSingle,
} from "../src/mappings/smol-treasures";
import {
  createItemListedEvent,
  createItemSoldEvent,
  createTransferBatchEvent,
  createTransferSingleEvent,
} from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const LISTING_ENTITY_TYPE = "Listing";
const TOKEN_ENTITY_TYPE = "Token";
const BUYER_ADDRESS = "0x999950b159366edcd2bcbee8126d973ac4923111";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("smol treasures have correct names", () => {
  clearStore();

  const contract = SMOL_TREASURES_ADDRESS.toHexString();
  const ids = [1, 2, 3, 4, 5];
  const tokenIds: BigInt[] = [];
  const tokens: string[] = [];

  for (let index = 0; index < 5; index++) {
    const tokenId = ids[index];

    const mintEvent = createTransferBatchEvent(
      SMOL_TREASURES_ADDRESS,
      Address.zero().toHexString(),
      USER_ADDRESS,
      [tokenId],
      [1]
    );

    handleTransferBatch(mintEvent);

    tokenIds.push(BigInt.fromI32(tokenId));
    tokens.push(`${contract}-${BigInt.fromI32(tokenId).toHexString()}`);
  }

  const collectionId = `${contract}`;

  const names = [
    "Moon Rock",
    "Stardust",
    "Comet Shard",
    "Lunar Gold",
    "Alien Relic",
  ];

  for (let index = 0; index < 5; index++) {
    const tokenId = tokenIds[index];
    const id = `${contract}-${tokenId.toHexString()}`;
    const name = names[index];

    assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
    assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", name);
    assert.fieldEquals(
      TOKEN_ENTITY_TYPE,
      id,
      "owners",
      `[${USER_ADDRESS}-${id}]`
    );
    assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", `${tokenId}`);
  }

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalSales", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalVolume", "0");
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "tokens",
    `[${tokens.join(", ")}]`
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "floorPrice", "0");
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "listings", "[]");
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "name",
    "Smol Treasures"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "contract",
    contract
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "standard",
    "ERC1155"
  );
});

test("smol treasures work via marketplace", () => {
  clearStore();

  const mintEvent = createTransferBatchEvent(
    SMOL_TREASURES_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    [2],
    [3]
  );

  handleTransferBatch(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_TREASURES_ADDRESS,
    2,
    3,
    50
  );

  handleItemListed(itemListedEvent);

  const collectionId = SMOL_TREASURES_ADDRESS.toHexString();
  const id = `${collectionId}-0x2`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "3");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "50");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);

  // Transfer from seller to marketplace buyer
  const sellerTransfer = createTransferSingleEvent(
    SMOL_TREASURES_ADDRESS,
    USER_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    2,
    1,
    MARKETPLACE_ADDRESS
  );

  handleTransferSingle(sellerTransfer);

  const itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    SMOL_TREASURES_ADDRESS,
    2,
    1,
    50
  );

  handleItemSold(itemSoldEvent);

  // Transfer from marketplace buyer to actual buyer
  const buyerTransfer = createTransferSingleEvent(
    SMOL_TREASURES_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    BUYER_ADDRESS,
    2,
    1,
    MARKETPLACE_BUYER_ADDRESS
  );

  handleTransferSingle(buyerTransfer);

  const soldId = `${listingId}-0xa16081f360e3847006db660bae1c6d1b2e17ec2a`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "2");

  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "status", "Sold");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "pricePerItem", "50");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "collection", collectionId);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "seller", USER_ADDRESS);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "buyer", BUYER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "2"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );
});
