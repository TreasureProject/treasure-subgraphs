import {
  assert,
  clearStore,
  createMockedFunction,
  mockIpfsFile,
  test,
} from "matchstick-as";

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

const BASE_URI =
  "https://treasure-marketplace.mypinata.cloud/ipfs/Qmbt6W9QB74VZzJfWbqG7vi2hiE2K4AnoyvWGFDHEjgoqN/";

createMockedFunction(
  SMOL_BODIES_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString(BASE_URI)]);

mockIpfsFile(
  "Qmbt6W9QB74VZzJfWbqG7vi2hiE2K4AnoyvWGFDHEjgoqN/1/0",
  "tests/smol-bodies/1.json"
);

test("collection base uri is changed", () => {
  clearStore();

  const address = SMOL_BODIES_ADDRESS.toHexString();
  handleTransfer(
    createTransferEvent(Address.zero().toHexString(), USER_ADDRESS, 1)
  );

  handleBaseUriChanged(createBaseUriChangedEvent("", BASE_URI));

  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "baseUri", BASE_URI);
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "name",
    "Smol Bodies #1"
  );
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "image",
    "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/1/0.png"
  );
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${address}-0x1`,
    "attributes",
    `[${address}-gender-male]`
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
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "baseUri", BASE_URI);

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
