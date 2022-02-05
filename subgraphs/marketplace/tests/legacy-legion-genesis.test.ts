import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as/assembly";
import { handleTransferSingle } from "../src/mappings/legacy-legions-genesis";

import { createTransferSingleEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const LEGACY_LEGION_GENESIS_ADDRESS = Address.fromString(
  "0x222950b159366edcd2bcbee8126d973ac4923111"
);
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("legacy legions genesis have correct names", () => {
  clearStore();

  const contract = LEGACY_LEGION_GENESIS_ADDRESS.toHexString();

  const mintEvent = createTransferSingleEvent(
    LEGACY_LEGION_GENESIS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransferSingle(mintEvent);

  const collectionId = `${contract}`;

  const tokenId = BigInt.fromI32(1);
  const id = `${contract}-${tokenId.toHexString()}`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "All-Class 1");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "owners",
    `[${USER_ADDRESS}-${id}]`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", `${tokenId}`);

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
    "Unpilgrimaged Legion Genesis"
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
