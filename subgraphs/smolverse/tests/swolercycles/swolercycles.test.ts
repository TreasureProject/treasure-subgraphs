import {
  assert,
  clearStore,
  createMockedFunction,
  mockIpfsFile,
  test,
} from "matchstick-as";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { SWOLERCYCLES_ADDRESS } from "@treasure/constants";

import {
  handleBaseUriChanged,
  handleTransfer,
} from "../../src/mappings/swolercycles";
import {
  COLLECTION_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";
import { createBaseUriChangedEvent, createTransferEvent } from "./utils";

createMockedFunction(
  SWOLERCYCLES_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString("test")]);

test("collection base uri is changed", () => {
  clearStore();

  const address = SWOLERCYCLES_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "name",
    "Swolercycles #1"
  );

  mockIpfsFile(
    "QmWyCqeGA5jXPofJYqx2WirWgeK7ei4GhaNzEySPAxn9ja/1",
    "tests/swolercycles/1.json"
  );

  const baseUri =
    "https://treasure-marketplace.mypinata.cloud/ipfs/QmWyCqeGA5jXPofJYqx2WirWgeK7ei4GhaNzEySPAxn9ja/";
  const baseUriChangedEvent = createBaseUriChangedEvent("", baseUri);

  handleBaseUriChanged(baseUriChangedEvent);

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "baseUri", baseUri);

  assert.fieldEquals(TOKEN_ENTITY_TYPE, `${address}-0x1`, "name", "Cycle #1");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "image",
    "ipfs://QmUqm5andJ4u6HMTuvtMmhMKs6oskGceRgXruRnt19CNR4/1.png"
  );
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "attributes",
    "[0xda1c260309d12f65a1ceaa8fdec71bd7bb3912f8-backgrounds-punk-garage]"
  );
});

test("token is minted", () => {
  clearStore();

  const address = SWOLERCYCLES_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  // Assert collection base URI is set
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "baseUri", "test");

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
});
