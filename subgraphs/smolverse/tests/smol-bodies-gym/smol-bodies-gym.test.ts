import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";

import { Collection, StakedToken, Token, User } from "../../generated/schema";
import {
  handleDropGym,
  handleJoinGym,
} from "../../src/mappings/smol-bodies-gym";
import {
  ATTRIBUTE_ENTITY_TYPE,
  STAKED_TOKEN_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";
import { createDropGymEvent, createJoinGymEvent } from "./utils";

test("smol bodies joining gym creates staked token", () => {
  clearStore();

  const joinEvent = createJoinGymEvent(USER_ADDRESS, 1);
  handleJoinGym(joinEvent);

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert collection was created
  const collection = Collection.load(
    SMOL_BODIES_ADDRESS.toHexString()
  ) as Collection;
  assert.assertNotNull(collection);

  // Assert token was created
  const tokenId = `${collection.id}-0x1`;
  const token = Token.load(tokenId) as Token;
  assert.stringEquals(token.collection, collection.id);
  assert.bigIntEquals(token.tokenId, BigInt.fromI32(1));

  // Assert staked token was created
  const stakedTokenId = `${tokenId}-gym`;
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
    "Gym"
  );
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedTokenId,
    "owner",
    USER_ADDRESS
  );
});

test("smol bodies dropping gym removes staked token", () => {
  clearStore();

  const joinEvent = createJoinGymEvent(USER_ADDRESS, 1);
  handleJoinGym(joinEvent);

  // Assert staked token was created
  const tokenId = `${SMOL_BODIES_ADDRESS.toHexString()}-0x1`;
  const stakedTokenId = `${tokenId}-gym`;
  let stakedToken = StakedToken.load(stakedTokenId);
  assert.assertNotNull(stakedToken);

  const dropEvent = createDropGymEvent(USER_ADDRESS, 1, 1, 1);
  handleDropGym(dropEvent);

  // Assert staked token was removed
  stakedToken = StakedToken.load(stakedTokenId);
  assert.assertNull(stakedToken);
});

test("smol bodies dropping gym updates plates and swol size", () => {
  clearStore();

  const joinEvent = createJoinGymEvent(USER_ADDRESS, 1);
  handleJoinGym(joinEvent);

  const dropEvent = createDropGymEvent(USER_ADDRESS, 1, 1, 1);
  handleDropGym(dropEvent);

  // Assert plates attribute is updated
  const platesAttributeId = `${SMOL_BODIES_ADDRESS.toHexString()}-plates-0x1`;
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, platesAttributeId, "value", "1");

  // Assert Swol Size attribute is updated
  const swolSizeAttributeId = `${SMOL_BODIES_ADDRESS.toHexString()}-swol-size-1`;
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    `${SMOL_BODIES_ADDRESS.toHexString()}-0x1`,
    "attributes",
    `[${swolSizeAttributeId}, ${platesAttributeId}]`
  );
});
