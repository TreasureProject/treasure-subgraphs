import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { TREASURE_ADDRESS } from "@treasure/constants";

import {
  handleTransferBatch,
  handleTransferSingle,
} from "../src/mappings/treasures";
import { createTransferBatchEvent, createTransferSingleEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("treasures collection is setup properly", () => {
  clearStore();

  const mintEvent = createTransferSingleEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    95
  );

  handleTransferSingle(mintEvent);

  const collectionId = TREASURE_ADDRESS.toHexString();
  const id = `${collectionId}-0x5f`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Grin");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "95");

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
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "name", "Treasures");
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
    "ERC1155"
  );
});

test("doesnt add treasure id 0 to inventory (single)", () => {
  clearStore();

  const mintEvent = createTransferSingleEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    0
  );

  handleTransferSingle(mintEvent);

  const collectionId = TREASURE_ADDRESS.toHexString();
  const id = `${collectionId}-0x0`;

  assert.notInStore(TOKEN_ENTITY_TYPE, id);
});

test("doesnt add treasure id 0 to inventory (batch)", () => {
  clearStore();

  const mintEvent = createTransferBatchEvent(
    TREASURE_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    [0],
    [0]
  );

  handleTransferBatch(mintEvent);

  const collectionId = TREASURE_ADDRESS.toHexString();
  const id = `${collectionId}-0x0`;

  assert.notInStore(TOKEN_ENTITY_TYPE, id);
});
