import { assert, clearStore, createMockedFunction, test } from "matchstick-as";

import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";

import { Collection, StakedToken, Token, User } from "../../generated/schema";
import {
  handleDropSchool,
  handleJoinSchool,
} from "../../src/mappings/smol-brains-school";
import {
  ATTRIBUTE_ENTITY_TYPE,
  STAKED_TOKEN_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";
import { createDropSchoolEvent, createJoinSchoolEvent } from "./utils";

const IQ_STRING = "206657655423280423280";

createMockedFunction(SMOL_BRAINS_ADDRESS, "brainz", "brainz(uint256):(uint256)")
  .withArgs([ethereum.Value.fromI32(1)])
  .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(IQ_STRING))]);

test("smol brains joining school creates staked token", () => {
  clearStore();

  const joinEvent = createJoinSchoolEvent(USER_ADDRESS, 1);
  handleJoinSchool(joinEvent);

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert collection was created
  const collection = Collection.load(
    SMOL_BRAINS_ADDRESS.toHexString()
  ) as Collection;
  assert.assertNotNull(collection);

  // Assert token was created
  const tokenId = `${collection.id}-0x1`;
  const token = Token.load(tokenId) as Token;
  assert.stringEquals(token.collection, collection.id);
  assert.bigIntEquals(token.tokenId, BigInt.fromI32(1));

  // Assert staked token was created
  const stakedTokenId = `${tokenId}-school`;
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedTokenId,
    "token",
    token.id
  );
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedTokenId,
    "location",
    "School"
  );
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedTokenId,
    "owner",
    USER_ADDRESS
  );
});

test("smol brains dropping school removes staked token", () => {
  clearStore();

  const joinEvent = createJoinSchoolEvent(USER_ADDRESS, 1);
  handleJoinSchool(joinEvent);

  // Assert staked token was created
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

test("smol brains dropping school updates IQ and head size", () => {
  clearStore();

  const joinEvent = createJoinSchoolEvent(USER_ADDRESS, 1);
  handleJoinSchool(joinEvent);

  const dropEvent = createDropSchoolEvent(USER_ADDRESS, 1);
  handleDropSchool(dropEvent);

  // Assert IQ attribute is updated
  const iqAttributeId = `${SMOL_BRAINS_ADDRESS.toHexString()}-iq-0x1`;
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, iqAttributeId, "value", IQ_STRING);

  // Assert Head Size attribute is updated
  const headSizeAttributeId = `${SMOL_BRAINS_ADDRESS.toHexString()}-head-size-4`;
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${SMOL_BRAINS_ADDRESS.toHexString()}-0x1`,
    "attributes",
    `[${headSizeAttributeId}, ${iqAttributeId}]`
  );
});
