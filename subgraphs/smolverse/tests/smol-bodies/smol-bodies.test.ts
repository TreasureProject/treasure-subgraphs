import { assert, clearStore, createMockedFunction, test } from "matchstick-as";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { SMOL_BODIES_ADDRESS } from "@treasure/constants";

import {
  handleBaseUriChanged,
  handleTransfer,
} from "../../src/mappings/smol-bodies";
import {
  COLLECTION_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";
import { createBaseUriChangedEvent, createTransferEvent } from "./utils";

createMockedFunction(
  SMOL_BODIES_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString("test")]);

test("collection base uri is changed", () => {
  clearStore();

  const baseUri =
    "https://treasure-marketplace.mypinata.cloud/ipfs/Qmbt6W9QB74VZzJfWbqG7vi2hiE2K4AnoyvWGFDHEjgoqN/";
  const baseUriChangedEvent = createBaseUriChangedEvent("", baseUri);

  handleBaseUriChanged(baseUriChangedEvent);

  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    baseUriChangedEvent.address.toHexString(),
    "baseUri",
    baseUri
  );
});

test("token is minted", () => {
  clearStore();

  const address = SMOL_BODIES_ADDRESS.toHexString();
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
