import { Address, ethereum } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { assert, clearStore, createMockedFunction, test } from "matchstick-as";

import { handleTransfer } from "../../src/mappings/smol-brains";
import { COLLECTION_ENTITY_TYPE, TOKEN_ENTITY_TYPE, USER_ADDRESS } from "../utils";
import { createTransferEvent } from "./utils";

createMockedFunction(SMOL_BRAINS_ADDRESS, "baseURI", "baseURI():(string)")
  .returns([ethereum.Value.fromString("test")]);

test("token is minted", () => {
  clearStore();

  const address = SMOL_BRAINS_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  // Assert collection base URI is set
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "baseUri", "test");

  // Assert token is created
  assert.fieldEquals(TOKEN_ENTITY_TYPE, `${address}-0x1`, "collection", address);
  assert.fieldEquals(TOKEN_ENTITY_TYPE, `${address}-0x1`, "owner", USER_ADDRESS);
});
