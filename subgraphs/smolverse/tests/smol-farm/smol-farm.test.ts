import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_TREASURES_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";
import { Collection, StakedToken, Token, User } from "../../generated/schema";

import { getCollectionId, getStakedTokenId, getTokenId } from "../../src/helpers/ids";
import { handleRandomRequest } from "../../src/mappings/randomizer";
import {
  handleRewardClaimed,
  handleSmolStaked,
  handleSmolUnstaked,
  handleStartClaiming
} from "../../src/mappings/smol-farm";
import { createRandomRequestEvent } from "../randomizer/utils";
import {
  CLAIM_ENTITY_TYPE,
  COLLECTION_ENTITY_TYPE,
  STAKED_TOKEN_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS
} from "../utils";
import {
  createRewardClaimedEvent,
  createSmolStakedEvent,
  createSmolUnstakedEvent,
  createStartClaimingEvent,
  getClaimId
} from "./utils";

test("staked token is created", () => {
  clearStore();

  const tokenId = 1;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  // Assert user was created
  const user = User.load(USER_ADDRESS);
  assert.assertNotNull(user);

  // Assert collection was created
  const address = smolStakedEvent.params._smolAddress.toHexString();
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "tokensCount", "1");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "stakedTokensCount", "1");

  // Assert token was created
  const token = Token.load(getTokenId(Collection.load(address) as Collection, BigInt.fromI32(tokenId))) as Token;
  assert.stringEquals(token.collection, address);
  assert.bigIntEquals(token.tokenId, BigInt.fromI32(tokenId));

  // Assert staked token was created
  const stakedTokenId = getStakedTokenId(
    getCollectionId(smolStakedEvent.params._smolAddress),
    token.tokenId,
    "Farm"
  );
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "token", token.id);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "location", "Farm");
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "owner", USER_ADDRESS);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedTokenId, "stakeTime", "1644190714");
});

test("unstaked token is removed", () => {
  clearStore();

  const tokenId = 1;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  // Assert staked token was created
  const address = getCollectionId(smolStakedEvent.params._smolAddress);
  const stakedTokenId = getStakedTokenId(
    address,
    BigInt.fromI32(tokenId),
    "Farm"
  );
  assert.assertNotNull(StakedToken.load(stakedTokenId));
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "tokensCount", "1");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "stakedTokensCount", "1");

  const smolUnstakedEvent = createSmolUnstakedEvent(USER_ADDRESS, tokenId);
  handleSmolUnstaked(smolUnstakedEvent);

  // Assert staked token was removed
  assert.assertNull(StakedToken.load(stakedTokenId));
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "tokensCount", "1");
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "stakedTokensCount", "0");
});

test("staked token claim is started", () => {
  clearStore();

  const tokenId = 1;
  const requestId = 1234;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  const randomRequestEvent = createRandomRequestEvent(requestId, 9876);
  handleRandomRequest(randomRequestEvent);

  const startClaimingEvent = createStartClaimingEvent(USER_ADDRESS, tokenId, requestId);
  handleStartClaiming(startClaimingEvent);

  // Assert claim was created with starting status
  const claimId = getClaimId(
    getCollectionId(smolStakedEvent.params._smolAddress),
    BigInt.fromI32(tokenId),
    "Farm",
    BigInt.fromI32(requestId)
  );
  assert.fieldEquals(CLAIM_ENTITY_TYPE, claimId, "status", "Started");
});

test("staked token claim is completed", () => {
  clearStore();

  const tokenId = 1;
  const requestId = 1234;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  const randomRequestEvent = createRandomRequestEvent(requestId, 9876);
  handleRandomRequest(randomRequestEvent);

  const startClaimingEvent = createStartClaimingEvent(USER_ADDRESS, tokenId, requestId);
  handleStartClaiming(startClaimingEvent);

  const rewardClaimedEvent = createRewardClaimedEvent(USER_ADDRESS, tokenId, 4);
  handleRewardClaimed(rewardClaimedEvent);

  // Assert reward token collection was created
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, SMOL_TREASURES_ADDRESS.toHexString(), "name", "Smol Treasures");

  // Assert reward token was created
  const rewardTokenId = `${SMOL_TREASURES_ADDRESS.toHexString()}-0x4`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, rewardTokenId, "name", "Gold");

  // Assert claim was completed
  const claimId = getClaimId(
    getCollectionId(smolStakedEvent.params._smolAddress),
    BigInt.fromI32(tokenId),
    "Farm",
    BigInt.fromI32(requestId)
  );
  assert.fieldEquals(CLAIM_ENTITY_TYPE, claimId, "status", "Claimed");
  assert.fieldEquals(CLAIM_ENTITY_TYPE, claimId, "reward", rewardTokenId);
});
