import { assert, clearStore, logStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { handleTransfer } from "../src/mappings/toadstoolz";
import { createTransferEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const STATS_ENTITY_TYPE = "StatsData";
const TOADSTOOLZ_ADDRESS = Address.fromString(
  "0x09CAE384C6626102ABE47Ff50588A1dBe8432174"
);
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("toadstoolz collection is setup properly", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    TOADSTOOLZ_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const collectionId = TOADSTOOLZ_ADDRESS.toHexString();
  const id = `${collectionId}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Toadstoolz #1");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "1");

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalSales", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalVolume", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "tokens", `[${id}]`);
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
    "Toadstoolz"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "contract",
    collectionId
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "standard",
    "ERC721"
  );
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "1");
});

test("burn mechanic works", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    TOADSTOOLZ_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const burnEvent = createTransferEvent(
    TOADSTOOLZ_ADDRESS,
    USER_ADDRESS,
    Address.zero().toHexString(),
    1
  );

  handleTransfer(burnEvent);

  const collectionId = TOADSTOOLZ_ADDRESS.toHexString();
  const id = `${collectionId}-0x1`;

  logStore();

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Toadstoolz #1");
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owners", "[]");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "1");

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalSales", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "totalVolume", "0");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "tokens", `[${id}]`);
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
    "Toadstoolz"
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "contract",
    collectionId
  );
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    collectionId,
    "standard",
    "ERC721"
  );
  assert.fieldEquals(STATS_ENTITY_TYPE, collectionId, "items", "0");
});
