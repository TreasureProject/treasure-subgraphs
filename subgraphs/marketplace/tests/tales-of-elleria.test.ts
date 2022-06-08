import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { TALES_OF_ELLERIA_ADDRESS } from "@treasure/constants";

import { handleItemListed, handleStake721 } from "../src/mapping";
import { handleTransfer } from "../src/mappings/tales-of-elleria";
import {
  createItemListedEvent,
  createStakedEvent,
  createTransferEvent,
} from "./utils";

const LISTING_ENTITY_TYPE = "Listing";
const TOKEN_ENTITY_TYPE = "Token";
const STAKED_TOKEN_ENTITY_TYPE = "StakedToken";
const USER_ENTITY_TYPE = "User";

const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";
const USER_ADDRESS2 = "0x000050b159366edcd2bcbee8126d973ac4920000";

test("tales of elleria staked tokens are tracked properly when transfered", () => {
  clearStore();

  const mintEvent = createTransferEvent(
    TALES_OF_ELLERIA_ADDRESS,
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  // Stake the token
  const stakeEvent = createStakedEvent(USER_ADDRESS, 1);

  handleStake721(stakeEvent);

  // Create listing (Inactive)
  const listEvent = createItemListedEvent(
    USER_ADDRESS,
    TALES_OF_ELLERIA_ADDRESS,
    1,
    1,
    100
  );

  handleItemListed(listEvent);

  const collectionId = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const id = `${collectionId}-0x1`;
  const listingId = `${USER_ADDRESS}-${id}`;

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId, "status", "Inactive");

  // Now user 1 transfers to user 2
  const transferEvent = createTransferEvent(
    TALES_OF_ELLERIA_ADDRESS,
    USER_ADDRESS,
    USER_ADDRESS2,
    1
  );

  handleTransfer(transferEvent);

  // Now user 2 lists
  const listEvent2 = createItemListedEvent(
    USER_ADDRESS2,
    TALES_OF_ELLERIA_ADDRESS,
    1,
    1,
    200
  );

  handleItemListed(listEvent2);

  const listingId2 = `${USER_ADDRESS2}-${id}`;

  assert.notInStore(STAKED_TOKEN_ENTITY_TYPE, listingId);

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "staked", "[]");

  // Test will pass when upgrading to latest matchstick version
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owners", `[${listingId2}]`);

  assert.fieldEquals(LISTING_ENTITY_TYPE, listingId2, "status", "Inactive");

  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, listingId2, "id", listingId2);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, listingId2, "token", id);
});
