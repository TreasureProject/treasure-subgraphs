import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  LEGION_ADDRESS,
  MARKETPLACE_BUYER_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import {
  handleItemCanceled,
  handleItemListed,
  handleItemSold,
  handleItemUpdated,
} from "../src/mapping";
import {
  handleLegionCreated,
  handleTransfer as handleLegionTransfer,
} from "../src/mappings/legions";
import { handleTransfer as handleSmolBrainsTransfer } from "../src/mappings/smol-brains";
import { handleTransferSingle } from "../src/mappings/treasures";
import {
  createItemCanceledEvent,
  createItemListedEvent,
  createItemSoldEvent,
  createItemUpdatedEvent,
  createLegionCreatedEvent,
  createTransferEvent,
  createTransferSingleEvent,
} from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const LISTING_ENTITY_TYPE = "Listing";
const STATS_ENTITY_TYPE = "StatsData";
const USER_TOKEN_ENTITY_TYPE = "UserToken";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";
const BUYER_ADDRESS = "0x999950b159366edcd2bcbee8126d973ac4923111";
const SMOL_BRAINS_ADDRESS = Address.fromString(
  "0x6325439389E0797Ab35752B4F43a14C004f22A9c"
);

// Handles listing, updating, canceled via contract.
// Sold would never execute as contract would revert on transfer
test("recruit legions via marketplace contract are not added", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    LEGION_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleLegionTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 2, 6, 4);

  handleLegionCreated(legionCreatedEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1,
    1,
    100
  );

  handleItemUpdated(itemUpdatedEvent);

  const itemCanceledEvent = createItemCanceledEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1
  );

  handleItemCanceled(itemCanceledEvent);

  const contract = LEGION_ADDRESS.toHexString();
  const id = `${contract}-0x1`;

  assert.notInStore(COLLECTION_ENTITY_TYPE, contract);
  assert.notInStore(LISTING_ENTITY_TYPE, `${USER_ADDRESS}-${id}`);

  assert.fieldEquals(
    USER_TOKEN_ENTITY_TYPE,
    `${USER_ADDRESS}-${id}`,
    "id",
    `${USER_ADDRESS}-${id}`
  );

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    `${contract}-0`,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, `${contract}-0`, "listings", "[]");
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    `${contract}-1`,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, `${contract}-1`, "listings", "[]");
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    `${contract}-2`,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, `${contract}-2`, "listings", "[]");
});

test("legions genesis work via marketplace", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    LEGION_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleLegionTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1,
    1,
    100
  );

  handleItemUpdated(itemUpdatedEvent);

  const contract = LEGION_ADDRESS.toHexString();
  const collectionId = `${contract}-0`;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.notInStore(COLLECTION_ENTITY_TYPE, contract);

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "100");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );

  // Transfer from seller to marketplace buyer
  const sellerTransfer = createTransferEvent(
    LEGION_ADDRESS,
    USER_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    1
  );

  handleLegionTransfer(sellerTransfer);

  const itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    LEGION_ADDRESS,
    1,
    1,
    100
  );

  handleItemSold(itemSoldEvent);

  // Transfer from marketplace buyer to actual buyer
  const buyerTransfer = createTransferEvent(
    LEGION_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    BUYER_ADDRESS,
    1
  );

  handleLegionTransfer(buyerTransfer);

  const soldId = `${listingId}-0xa16081f360e3847006db660bae1c6d1b2e17ec2a`;

  assert.notInStore(COLLECTION_ENTITY_TYPE, contract);
  assert.notInStore(LISTING_ENTITY_TYPE, listingId);

  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "status", "Sold");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "pricePerItem", "100");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "collection", collectionId);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "seller", USER_ADDRESS);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "buyer", BUYER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "listings", "[]");
});

test("smol brains work via marketplace", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    100
  );

  handleItemUpdated(itemUpdatedEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "100");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );

  // Transfer from seller to marketplace buyer
  const sellerTransfer = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    USER_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    1
  );

  handleSmolBrainsTransfer(sellerTransfer);

  const itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    100
  );

  handleItemSold(itemSoldEvent);

  // Transfer from marketplace buyer to actual buyer
  const buyerTransfer = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    BUYER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(buyerTransfer);

  const soldId = `${listingId}-0xa16081f360e3847006db660bae1c6d1b2e17ec2a`;

  assert.notInStore(LISTING_ENTITY_TYPE, listingId);

  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "status", "Sold");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "pricePerItem", "100");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "collection", collectionId);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "seller", USER_ADDRESS);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "buyer", BUYER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "listings", "[]");
});

test("removes listing when quantity updated to 0", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "50");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    0,
    100
  );

  handleItemUpdated(itemUpdatedEvent);

  assert.notInStore(LISTING_ENTITY_TYPE, listingId);
});

test("supports expires in milliseconds", () => {
  clearStore();

  const expires = 1641042689000 as i32;

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50,
    expires,
    expires / 1000
  );

  handleItemListed(itemListedEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "50");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "expires", `${expires}`);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    100,
    expires + 10_000
  );

  handleItemUpdated(itemUpdatedEvent);

  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "expires",
    `${expires + 10_000}`
  );
});

test("supports expires in seconds", () => {
  clearStore();

  const expires = 1641042689 as i32;

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50,
    expires
  );

  handleItemListed(itemListedEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "pricePerItem", "50");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "seller", USER_ADDRESS);
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "expires",
    `${expires}000`
  );

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${listingId}]`
  );

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    100,
    expires + 10
  );

  handleItemUpdated(itemUpdatedEvent);

  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    listingId,
    "expires",
    `${expires + 10}000`
  );
});

test("expire listing when block timestamp is past", () => {
  clearStore();

  let mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    2
  );

  handleSmolBrainsTransfer(mintEvent);

  let itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const firstId = `${contract}-0x1`;
  const firstListingId = `${USER_ADDRESS}-${firstId}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, firstListingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, firstListingId, "token", firstId);
  assert.fieldEquals(LISTING_ENTITY_TYPE, firstListingId, "quantity", "1");
  assert.fieldEquals(LISTING_ENTITY_TYPE, firstListingId, "pricePerItem", "50");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    firstListingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    firstListingId,
    "seller",
    USER_ADDRESS
  );
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    firstListingId,
    "expires",
    "1656403681000"
  );

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${firstListingId}]`
  );

  itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    2,
    1,
    50,
    1656403682 as i32
  );

  handleItemListed(itemListedEvent);

  const secondId = `${contract}-0x2`;
  const secondListingId = `${USER_ADDRESS}-${secondId}`;

  // First listing is now expired
  assert.fieldEquals(LISTING_ENTITY_TYPE, firstListingId, "status", "Expired");

  assert.fieldEquals(LISTING_ENTITY_TYPE, secondListingId, "status", "Active");
  assert.fieldEquals(LISTING_ENTITY_TYPE, secondListingId, "token", secondId);
  assert.fieldEquals(LISTING_ENTITY_TYPE, secondListingId, "quantity", "1");
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    secondListingId,
    "pricePerItem",
    "50"
  );
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    secondListingId,
    "collection",
    collectionId
  );
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    secondListingId,
    "seller",
    USER_ADDRESS
  );
  assert.fieldEquals(
    LISTING_ENTITY_TYPE,
    secondListingId,
    "expires",
    "1656403682000"
  );

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "1"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "listings",
    `[${firstListingId}, ${secondListingId}]`
  );
});

test("handles the stats properly", () => {
  clearStore();

  let mintEvent = createTransferSingleEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    95
  );

  handleTransferSingle(mintEvent);

  mintEvent = createTransferSingleEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    95
  );

  handleTransferSingle(mintEvent);

  mintEvent = createTransferSingleEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    94
  );

  handleTransferSingle(mintEvent);

  let itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const collectionId = TREASURE_ADDRESS.toHexString();
  const firstId = `${collectionId}-0x5f`;
  const secondId = `${collectionId}-0x5e`;

  // Token 95 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "floorPrice", "50");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "items", "2");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "volume", "0");

  // Token 94 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "floorPrice", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "items", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "listings", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "volume", "0");

  // Collection specific
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "floorPrice", "50");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "3");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "volume", "0");

  itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    94,
    1,
    500
  );

  handleItemListed(itemListedEvent);

  const itemUpdatedEvent = createItemUpdatedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    2,
    200
  );

  handleItemUpdated(itemUpdatedEvent);

  let itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    200
  );

  handleItemSold(itemSoldEvent);

  let volume = BigInt.fromI32(200);

  // Token 95 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "floorPrice", "200");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "items", "2");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "sales", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "volume", volume.toString());

  // Token 94 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "floorPrice", "500");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "items", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "volume", "0");

  // Collection specific
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "floorPrice", "200");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "3");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "listings", "2");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "sales", "1");
  assert.fieldEquals(
    STATS_ENTITY_TYPE,
    collectionId,
    "volume",
    volume.toString()
  );

  itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    200
  );

  handleItemSold(itemSoldEvent);

  volume = volume.plus(BigInt.fromI32(200));

  // Token 95 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "floorPrice", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "items", "2");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "listings", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "sales", "2");
  assert.fieldEquals(STATS_ENTITY_TYPE, firstId, "volume", volume.toString());

  // Token 94 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "floorPrice", "500");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "items", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "volume", "0");

  // Collection specific
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "floorPrice", "500");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "3");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "listings", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "sales", "2");
  assert.fieldEquals(
    STATS_ENTITY_TYPE,
    collectionId,
    "volume",
    volume.toString()
  );

  const itemCanceledEvent = createItemCanceledEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    94
  );

  handleItemCanceled(itemCanceledEvent);

  // Token 94 specific
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "floorPrice", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "items", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "listings", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, secondId, "volume", "0");

  // Collection specific
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "floorPrice", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "3");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "listings", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "sales", "2");
  assert.fieldEquals(
    STATS_ENTITY_TYPE,
    collectionId,
    "volume",
    volume.toString()
  );
});

test("mark listings sold with 0 quantity as invalid", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleSmolBrainsTransfer(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    1,
    50
  );

  handleItemListed(itemListedEvent);

  const itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    1,
    0,
    50
  );

  handleItemSold(itemSoldEvent);

  const contract = SMOL_BRAINS_ADDRESS.toHexString();
  const collectionId = contract;
  const id = `${contract}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;
  const soldId = `${listingId}-0xa16081f360e3847006db660bae1c6d1b2e17ec2a`;

  assert.notInStore(LISTING_ENTITY_TYPE, listingId);

  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "status", "Invalid");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "token", id);
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "quantity", "0");
  assert.fieldEquals(LISTING_ENTITY_TYPE, soldId, "pricePerItem", "50");

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "totalListings",
    "0"
  );
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalSales", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalVolume", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "listings", "[]");

  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "floorPrice", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "1");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "listings", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "sales", "0");
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "volume", "0");
});
