import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { BATTLEFLY_FOUNDERS_ADDRESS } from "@treasure/constants";

import { handleTransferFounder } from "../src/mappings/battlefly";
import { createLegionCreatedEvent, createTransferEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const USER_TOKEN_ENTITY_TYPE = "UserToken";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("battlefly v1 founders collection is setup properly (tokenId 1)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-1`;
  const id = `${contract}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
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
    "BattleFly v1 Founders NFT"
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
    "ERC721"
  );
});

test("battlefly v1 founders collection is setup properly (tokenId 220)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    220
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-1`;
  const id = `${contract}-0xdc`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "220");

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
    "BattleFly v1 Founders NFT"
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
    "ERC721"
  );
});

test("battlefly v2 founders collection is setup properly (tokenId 221)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    221
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-2`;
  const id = `${contract}-0xdd`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "221");

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
    "BattleFly v2 Founders NFT"
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
    "ERC721"
  );
});

test("battlefly v2 founders collection is setup properly (tokenId 4220)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    4220
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-2`;
  const id = `${contract}-0x107c`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "4220");

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
    "BattleFly v2 Founders NFT"
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
    "ERC721"
  );
});

test("battlefly founders collection not assigned (tokenId 0)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    0
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-0`;
  const id = `${contract}-0x0`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "0");

  assert.notInStore(COLLECTION_ENTITY_TYPE, collectionId);
});

test("battlefly founders collection not assigned (tokenId 4221)", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    BATTLEFLY_FOUNDERS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    4221
  );

  handleTransferFounder(mintEvent);

  const contract = BATTLEFLY_FOUNDERS_ADDRESS.toHexString();
  const collectionId = `${contract}-0`;
  const id = `${contract}-0x107d`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "4221");

  assert.notInStore(COLLECTION_ENTITY_TYPE, collectionId);
});
