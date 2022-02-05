import { Address, BigInt } from "@graphprotocol/graph-ts";
import { CONSUMABLE_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as/assembly";
import { handleTransferBatch } from "../src/mappings/consumables";

import { createTransferBatchEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const TOKEN_ENTITY_TYPE = "Token";
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
