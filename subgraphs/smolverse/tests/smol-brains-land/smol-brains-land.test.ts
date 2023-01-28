import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { SMOL_BRAINS_LAND_ADDRESS } from "@treasure/constants";

import { Attribute, _LandMetadata } from "../../generated/schema";
import { SMOL_BRAINS_LAND_BASE_URI } from "../../src/helpers/constants";
import { handleTransfer } from "../../src/mappings/smol-brains-land";
import {
  COLLECTION_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";
import { createTransferEvent } from "./utils";

test("token is minted", () => {
  clearStore();

  const attribute1 = new Attribute("test-attribute1");
  attribute1.name = "Location";
  attribute1.value = "Moon";
  attribute1.collection = SMOL_BRAINS_LAND_ADDRESS.toHexString();
  attribute1._tokenIds = [];
  attribute1.save();

  const attribute2 = new Attribute("test-attribute2");
  attribute2.name = "Discovery";
  attribute2.value = "Gym Opening";
  attribute2.collection = SMOL_BRAINS_LAND_ADDRESS.toHexString();
  attribute2._tokenIds = [];
  attribute2.save();

  const landMetadata = new _LandMetadata("all");
  landMetadata.name = "Smol Land";
  landMetadata.description = "Smol Land";
  landMetadata.image =
    "https://treasure-marketplace.mypinata.cloud/ipfs/QmYAkzPbwL7F4S8QrabVgNQMCstfzdcpv1K2XNjBNvvko7/24";
  landMetadata.attributes = ["test-attribute1", "test-attribute2"];
  landMetadata.save();

  const address = SMOL_BRAINS_LAND_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  // Assert collection base URI is set
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    address,
    "baseUri",
    SMOL_BRAINS_LAND_BASE_URI
  );

  // Assert token is created
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "collection",
    address
  );
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "owner",
    USER_ADDRESS
  );
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "attributes",
    "[test-attribute1, test-attribute2]"
  );
});
