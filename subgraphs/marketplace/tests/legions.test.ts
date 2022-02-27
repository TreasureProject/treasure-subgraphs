import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { handleLegionCreated, handleTransfer } from "../src/mappings/legions";
import { createLegionCreatedEvent, createTransferEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const USER_TOKEN_ENTITY_TYPE = "UserToken";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("legion 1/1s have correct names", () => {
  clearStore();

  const contract = LEGION_ADDRESS.toHexString();
  const ids = [523, 1629, 1744, 2239, 3476];
  const tokenIds: BigInt[] = [];
  const tokens: string[] = [];

  for (let index = 0; index < 5; index++) {
    const tokenId = ids[index];

    const mintEvent = createTransferEvent(
      LEGION_ADDRESS,
      Address.zero().toHexString(),
      USER_ADDRESS,
      tokenId
    );

    handleTransfer(mintEvent);

    const legionCreatedEvent = createLegionCreatedEvent(
      USER_ADDRESS,
      tokenId,
      0,
      9,
      0
    );

    handleLegionCreated(legionCreatedEvent);

    tokenIds.push(BigInt.fromI32(tokenId));
    tokens.push(`${contract}-${BigInt.fromI32(tokenId).toHexString()}`);
  }

  const collectionId = `${contract}-0`;

  const names = [
    "Bombmaker",
    "Warlock",
    "Fallen",
    "Dreamwinder",
    "Clocksnatcher",
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
    "Legion Genesis"
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

test("legion genesis collection is setup properly", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    LEGION_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const contract = LEGION_ADDRESS.toHexString();
  const collectionId = `${contract}-0`;
  const id = `${contract}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Genesis Special");
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
    "Legion Genesis"
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

test("legion auxiliary collection is setup properly", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    LEGION_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 1, 6, 4);

  handleLegionCreated(legionCreatedEvent);

  const contract = LEGION_ADDRESS.toHexString();
  const collectionId = `${contract}-1`;
  const id = `${contract}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Auxiliary Common");
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
    "Legion Auxiliary"
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

test("recruits are setup correctly", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    LEGION_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 2, 6, 4);

  handleLegionCreated(legionCreatedEvent);

  const contract = LEGION_ADDRESS.toHexString();
  const collectionId = `${contract}-2`;
  const id = `${contract}-0x1`;

  assert.fieldEquals(
    USER_TOKEN_ENTITY_TYPE,
    `${USER_ADDRESS}-${id}`,
    "id",
    `${USER_ADDRESS}-${id}`
  );

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Recruit");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "1");

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, collectionId, "name", "Legions");
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
