import { SMOL_BODIES_ADDRESS, SMOL_BRAINS_ADDRESS, SMOL_BRAINS_LAND_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";
import { User } from "../../generated/schema";
import { handleTransfer } from "../../src/mappings/erc721";

import { createTransferEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("smol bodies token is transfered", () => {
  clearStore();

  const transferEvent = createTransferEvent(SMOL_BODIES_ADDRESS, USER_ADDRESS, 1);
  handleTransfer(transferEvent);

  // Assert collection was created
  const collectionId = SMOL_BODIES_ADDRESS.toHexString();
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "name", "Smol Bodies");

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert token was created
  const tokenId = `${collectionId}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "tokenId", "1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "name", "Smol Bodies #1");
});

test("smol brains token is transfered", () => {
  clearStore();

  const transferEvent = createTransferEvent(SMOL_BRAINS_ADDRESS, USER_ADDRESS, 1);
  handleTransfer(transferEvent);

  // Assert collection was created
  const collectionId = SMOL_BRAINS_ADDRESS.toHexString();
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "name", "Smol Brains");

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert token was created
  const tokenId = `${collectionId}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "tokenId", "1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "name", "Smol Brains #1");
});

test("smol brains land token is transfered", () => {
  clearStore();
  
  const transferEvent = createTransferEvent(SMOL_BRAINS_LAND_ADDRESS, USER_ADDRESS, 1);
  handleTransfer(transferEvent);

  // Assert collection was created
  const collectionId = SMOL_BRAINS_LAND_ADDRESS.toHexString();
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "name", "Smol Brains Land");

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert token was created
  const tokenId = `${collectionId}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "tokenId", "1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, tokenId, "name", "Smol Brains Land #1");
});
