import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";

import { Collection, StakedToken, Token, User } from "../../generated/schema";
import { handleDropSchool, handleJoinSchool } from "../../src/mappings/smol-brains-school";
import { createDropSchoolEvent, createJoinSchoolEvent } from "./utils";

const STAKED_TOKEN_ENTITY_TYPE = "StakedToken";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("smol brains joining school creates staked token", () => {
  clearStore();

  const joinEvent = createJoinSchoolEvent(USER_ADDRESS, 1);
  handleJoinSchool(joinEvent);

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert collection was created
  const collection = Collection.load(SMOL_BRAINS_ADDRESS.toHexString()) as Collection;
  assert.assertNotNull(collection);

  // Assert token was created
  const tokenId = `${collection.id}-0x1`;
  const token = Token.load(tokenId) as Token;
  assert.stringEquals(token.collection, collection.id);
  assert.bigIntEquals(token.tokenId, BigInt.fromI32(1));

  // Assert staked token was crerated
  const stakedTokenId = `${tokenId}-school`;
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "token", token.id);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "location", "School");
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "owner", USER_ADDRESS);
});

test("smol brains dropping school removes staked token", () => {
  clearStore();

  const joinEvent = createJoinSchoolEvent(USER_ADDRESS, 1);
  handleJoinSchool(joinEvent);

  // Assert staked token was crerated
  const tokenId = `${SMOL_BRAINS_ADDRESS.toHexString()}-0x1`;
  const stakedTokenId = `${tokenId}-school`;
  let stakedToken = StakedToken.load(stakedTokenId);
  assert.assertNotNull(stakedToken);

  const dropEvent = createDropSchoolEvent(USER_ADDRESS, 1);
  handleDropSchool(dropEvent);

  // Assert staked token was removed
  stakedToken = StakedToken.load(stakedTokenId);
  assert.assertNull(stakedToken);
});
