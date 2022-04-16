import { log, store } from "@graphprotocol/graph-ts";

import { SEED_OF_LIFE_TREASURES_ADDRESS } from "@treasure/constants";

import {
  FinishedUnstakingTreasure,
  ImbuedSoulClaimed,
  LifeformCreated,
  StartedClaimingImbuedSoul,
  StartedUnstakingTreasure,
} from "../../generated/SeedEvolution/SeedEvolution";
import {
  BrokenToken,
  ClaimLifeformRequest,
  Lifeform,
  StakedToken,
  UnstakeTokenRequest,
} from "../../generated/schema";
import { getOrCreateCollection } from "../helpers/collection";
import { LifeformRealm, ONE_BI, Path } from "../helpers/constants";
import { getOrCreateRandom } from "../helpers/random";
import { getOrCreateRealmStat } from "../helpers/realm";
import { getOrCreateToken } from "../helpers/token";
import { getNameForTokenId } from "../helpers/treasure";
import { getOrCreateUser } from "../helpers/user";

export function handleLifeformCreated(event: LifeformCreated): void {
  let evolutionInfo = event.params._evolutionInfo;

  let user = getOrCreateUser(evolutionInfo.owner.toHexString());

  let lifeform = new Lifeform(event.params._lifeformId.toHexString());

  let random = getOrCreateRandom(evolutionInfo.requestId);
  random._lifeformId = lifeform.id;
  random.save();

  lifeform.creationTimestamp = evolutionInfo.startTime;
  lifeform.user = user.id;
  lifeform.path = Path.getName(evolutionInfo.path);
  lifeform.firstRealm = LifeformRealm.getName(evolutionInfo.firstRealm);
  lifeform.secondRealm = LifeformRealm.getName(evolutionInfo.secondRealm);
  lifeform.treasureBoost = evolutionInfo.treasureBoost;
  lifeform._stakedTokenIds = [];

  let firstRealmStat = getOrCreateRealmStat(lifeform.firstRealm);
  firstRealmStat.stakedCount = firstRealmStat.stakedCount.plus(ONE_BI);
  firstRealmStat.save();

  let secondRealmStat = getOrCreateRealmStat(lifeform.secondRealm);
  secondRealmStat.stakedCount = secondRealmStat.stakedCount.plus(ONE_BI);
  secondRealmStat.save();

  let treasureCollection = getOrCreateCollection(
    SEED_OF_LIFE_TREASURES_ADDRESS
  );
  for (let i = 0; i < evolutionInfo.stakedTreasureIds.length; i++) {
    let tokenId = evolutionInfo.stakedTreasureIds[i];
    let token = getOrCreateToken(
      treasureCollection,
      tokenId,
      getNameForTokenId(tokenId)
    );
    let stakedToken = new StakedToken(`${lifeform.id}-${token.id}`);
    stakedToken.lifeform = lifeform.id;
    stakedToken.quantity = evolutionInfo.stakedTreasureAmounts[i];
    stakedToken.token = token.id;
    stakedToken.user = user.id;
    stakedToken.save();

    lifeform._stakedTokenIds = lifeform._stakedTokenIds.concat([
      stakedToken.id,
    ]);
  }

  lifeform.save();
}

export function handleStartedUnstakingTreasure(
  event: StartedUnstakingTreasure
): void {
  const params = event.params;

  const lifeform = Lifeform.load(params._lifeformId.toHexString());
  if (!lifeform) {
    log.error("[SeedEvolution] Unknown lifeform: {}", [
      params._lifeformId.toHexString(),
    ]);
    return;
  }

  const random = getOrCreateRandom(params._requestId);

  const unstakeTokenRequest = new UnstakeTokenRequest(lifeform.user);
  unstakeTokenRequest.lifeform = lifeform.id;
  unstakeTokenRequest.status = "NOT_READY";
  unstakeTokenRequest.save();

  random._unstakeTokenRequestId = unstakeTokenRequest.id;
  random.save();
}

export function handleFinishedUnstakingTreasure(
  event: FinishedUnstakingTreasure
): void {
  const params = event.params;

  const userId = params._owner.toHexString();

  const unstakeTokenRequest = UnstakeTokenRequest.load(userId);
  if (!unstakeTokenRequest) {
    log.error("[SeedEvolution] Unknown unstake token request: {}", [userId]);
    return;
  }

  const lifeform = Lifeform.load(unstakeTokenRequest.lifeform);
  if (!lifeform) {
    log.error("[SeedEvolution] Unknown lifeform: {}", [
      unstakeTokenRequest.lifeform,
    ]);
    return;
  }

  // Remove all of Lifeform's staked tokens
  for (let i = 0; i < lifeform._stakedTokenIds.length; i++) {
    store.remove("StakedToken", lifeform._stakedTokenIds[i]);
  }

  lifeform._stakedTokenIds = [];
  lifeform.save();

  // Add any broken tokens to the Lifeform
  const treasureCollection = getOrCreateCollection(
    SEED_OF_LIFE_TREASURES_ADDRESS
  );
  for (let i = 0; i < params._brokenTreasureIds.length; i++) {
    const tokenId = params._brokenTreasureIds[i];
    let token = getOrCreateToken(
      treasureCollection,
      tokenId,
      getNameForTokenId(tokenId)
    );
    const brokenToken = new BrokenToken(`${lifeform.id}-${token.id}`);
    brokenToken.lifeform = lifeform.id;
    brokenToken.quantity = params._brokenTreasureAmounts[i];
    brokenToken.token = token.id;
    brokenToken.user = userId;
    brokenToken.save();
  }

  store.remove("UnstakeTokenRequest", unstakeTokenRequest.id);
}

export function handleStartedClaimingImbuedSoul(
  event: StartedClaimingImbuedSoul
): void {
  const params = event.params;

  const lifeform = Lifeform.load(params._lifeformId.toHexString());
  if (!lifeform) {
    log.error("[SeedEvolution] Unknown lifeform: {}", [
      params._lifeformId.toHexString(),
    ]);
    return;
  }

  const random = getOrCreateRandom(params._claimRequestId);

  const claimLifeformRequest = new ClaimLifeformRequest(lifeform.id);
  claimLifeformRequest.lifeform = lifeform.id;
  claimLifeformRequest.status = "NOT_READY";
  claimLifeformRequest.save();

  random._claimLifeformRequestId = claimLifeformRequest.id;
  random.save();
}

export function handleImbuedSoulClaimed(event: ImbuedSoulClaimed): void {
  const params = event.params;

  const lifeform = Lifeform.load(params._lifeformId.toHexString());
  if (!lifeform) {
    log.error("[SeedEvolution] Unknown lifeform: {}", [
      params._lifeformId.toHexString(),
    ]);
    return;
  }

  const firstRealmStat = getOrCreateRealmStat(lifeform.firstRealm);
  firstRealmStat.stakedCount = firstRealmStat.stakedCount.minus(ONE_BI);
  firstRealmStat.save();

  const secondRealmStat = getOrCreateRealmStat(lifeform.secondRealm);
  secondRealmStat.stakedCount = secondRealmStat.stakedCount.minus(ONE_BI);
  secondRealmStat.save();

  store.remove("Lifeform", lifeform.id);
  store.remove("ClaimLifeformRequest", lifeform.id);
}
