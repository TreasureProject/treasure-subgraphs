import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { assert, test } from "matchstick-as";
import { Collection, Farm, Token, User } from "../../generated/schema";

import { SMOL_BRAINS_COLLECTION_NAME, SMOL_FARM_NAME } from "../../src/helpers/constants";
import { getFarmId, getStakedTokenId, getTokenId } from "../../src/helpers/ids";
import { handleSmolStaked } from "../../src/mappings/smol-farm";
import { createSmolStakedEvent } from "./utils";

const COLLECTION_ENTITY_TYPE = "Collection";
const FARM_ENTITY_TYPE = "Farm";
const STAKED_TOKEN_ENTITY_TYPE = "StakedToken";
const TOKEN_ENTITY_TYPE = "Token";
const USER_ENTITY_TYPE = "User";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("staked token is created", () => {
  const tokenId = 1;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  // Assert farm was created
  const farm = Farm.load(getFarmId(smolStakedEvent.address)) as Farm;
  assert.stringEquals(farm.name, SMOL_FARM_NAME);

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert collection was created
  const collection = Collection.load(SMOL_BRAINS_ADDRESS.toHexString()) as Collection;
  assert.stringEquals(collection.name, SMOL_BRAINS_COLLECTION_NAME);

  // Assert token was created
  const token = Token.load(getTokenId(collection, BigInt.fromI32(tokenId))) as Token;
  assert.stringEquals(token.collection, collection.id);
  assert.bigIntEquals(token.tokenId, BigInt.fromI32(tokenId));

  // Assert staked token was crerated
  const stakedTokenId = getStakedTokenId(token, farm);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "token", token.id);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "farm", farm.id);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "owner", USER_ADDRESS);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "stakeTime", "1644190714");
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "claims", "[]");
});
