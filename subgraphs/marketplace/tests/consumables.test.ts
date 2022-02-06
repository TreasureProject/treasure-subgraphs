import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  CONSUMABLE_ADDRESS,
  MARKETPLACE_ADDRESS,
  MARKETPLACE_BUYER_ADDRESS,
} from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as/assembly";
import { handleItemListed, handleItemSold } from "../src/mapping";
import {
  handleTransferBatch,
  handleTransferSingle,
} from "../src/mappings/consumables";

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

test("consumables have correct names", () => {
  clearStore();

  const contract = CONSUMABLE_ADDRESS.toHexString();
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const tokenIds: BigInt[] = [];
  const tokens: string[] = [];

  for (let index = 0; index < 13; index++) {
    const tokenId = ids[index];

    const mintEvent = createTransferBatchEvent(
      CONSUMABLE_ADDRESS,
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
    "Small Prism",
    "Medium Prism",
    "Large Prism",
    "Small Extractor",
    "Medium Extractor",
    "Large Extractor",
    "Harvestor",
    "Essence of Starlight",
    "Prism Shards",
    "Universal Lock",
    "Azurite Dust",
    "Essence of Honeycomb",
    "Essence of Grin",
  ];

  for (let index = 0; index < 13; index++) {
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
    "Consumables"
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

test("consumables work via marketplace", () => {
  clearStore();

  const mintEvent = createTransferBatchEvent(
    CONSUMABLE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    [8],
    [3]
  );

  handleTransferBatch(mintEvent);

  const itemListedEvent = createItemListedEvent(
    USER_ADDRESS,
    CONSUMABLE_ADDRESS,
    8,
    3,
    50
  );

  handleItemListed(itemListedEvent);

  const collectionId = CONSUMABLE_ADDRESS.toHexString();
  const id = `${collectionId}-0x8`;
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
    CONSUMABLE_ADDRESS,
    USER_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    8,
    1,
    MARKETPLACE_ADDRESS
  );

  handleTransferSingle(sellerTransfer);

  const itemSoldEvent = createItemSoldEvent(
    USER_ADDRESS,
    BUYER_ADDRESS,
    CONSUMABLE_ADDRESS,
    8,
    1,
    50
  );

  handleItemSold(itemSoldEvent);

  // Transfer from marketplace buyer to actual buyer
  const buyerTransfer = createTransferSingleEvent(
    CONSUMABLE_ADDRESS,
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    BUYER_ADDRESS,
    8,
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
