import { Address } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as/assembly";
import { handleTransfer } from "../src/mappings/smol-brains";

import { createTransferEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
const SMOL_BRAINS_ADDRESS = Address.fromString(
  "0x6325439389E0797Ab35752B4F43a14C004f22A9c"
);
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("smol brains collection is setup properly", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    SMOL_BRAINS_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const collectionId = SMOL_BRAINS_ADDRESS.toHexString();
  const id = `${collectionId}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "collection", collectionId);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Smol Brains #1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owners", `[${USER_ADDRESS}-${id}]`);
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
    "Smol Brains"
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
});
