import { Address, ethereum } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";
import {
  assert,
  clearStore,
  createMockedFunction,
  test,
} from "matchstick-as/assembly/index";

import { createBaseUriChangedEvent, createTransferEvent } from "./utils";
import {
  handleBaseUriChanged,
  handleTransfer,
} from "../../src/mappings/smol-pets";
import {
  COLLECTION_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";

createMockedFunction(
  SMOL_BODIES_PETS_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString("test")]);

test("collection base uri is changed", () => {
  clearStore();

  const baseUri = "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/";
  const baseUriChangedEvent = createBaseUriChangedEvent("", baseUri);

  handleBaseUriChanged(baseUriChangedEvent);

  // Assert collection base URI is updated
  assert.fieldEquals(
    COLLECTION_ENTITY_TYPE,
    baseUriChangedEvent.address.toHexString(),
    "baseUri",
    baseUri
  );
});

test("token is minted", () => {
  clearStore();

  const address = SMOL_BODIES_PETS_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    address,
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
