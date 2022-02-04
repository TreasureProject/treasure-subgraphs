import { Address } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as/assembly";
import {
  handleItemCanceled,
  handleItemListed,
  handleItemSold,
  handleItemUpdated,
} from "../src/mapping";
import { handleLegionCreated, handleTransfer as handleLegionTransfer } from "../src/mappings/legions";
import { handleTransfer as handleSmolBrainsTransfer } from "../src/mappings/smol-brains";

import {
  createItemCanceledEvent,
  createItemListedEvent,
  createItemSoldEvent,
  createItemUpdatedEvent,
  createLegionCreatedEvent,
  createTransferEvent,
  MARKETPLACE_BUYER_ADDRESS,
} from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const LISTING_ENTITY_TYPE = "Listing";
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

  assert.notInStore(USER_TOKEN_ENTITY_TYPE, `${USER_ADDRESS}-${id}`);
  assert.notInStore(COLLECTION_ENTITY_TYPE, contract);
  assert.notInStore(LISTING_ENTITY_TYPE, `${USER_ADDRESS}-${id}`);

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
    MARKETPLACE_BUYER_ADDRESS,
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
    MARKETPLACE_BUYER_ADDRESS,
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
    MARKETPLACE_BUYER_ADDRESS,
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
    MARKETPLACE_BUYER_ADDRESS,
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
