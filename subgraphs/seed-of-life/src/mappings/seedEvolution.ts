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
  ClaimLifeformRequest,
  Lifeform,
  TokenQuantity,
  UnstakeTokenRequest,
} from "../../generated/schema";
import { CollectionHelpers } from "../helpers/CollectionHelpers";
import { RandomHelpers } from "../helpers/RandomHelpers";
import { RealmStatHelpers } from "../helpers/RealmHelpers";
import { TokenHelpers } from "../helpers/TokenHelpers";
import { TreasureHelpers } from "../helpers/TreasureHelpers";
import { UserHelpers } from "../helpers/UserHelpers";
import { LifeformRealm, ONE_BI, Path } from "../helpers/constants";

export function handleLifeformCreated(event: LifeformCreated): void {
  let evolutionInfo = event.params._evolutionInfo;

  let user = UserHelpers.getOrCreateUser(evolutionInfo.owner.toHexString());

  let lifeform = new Lifeform(event.params._lifeformId.toHexString());

  let random = RandomHelpers.getOrCreateRandom(evolutionInfo.requestId);
  random._lifeformId = lifeform.id;
  random.save();

  lifeform.creationTimestamp = evolutionInfo.startTime;
  lifeform.user = user.id;
  lifeform.path = Path.getName(evolutionInfo.path);
  lifeform.firstRealm = LifeformRealm.getName(evolutionInfo.firstRealm);
  lifeform.secondRealm = LifeformRealm.getName(evolutionInfo.secondRealm);

  let firstRealmStat = RealmStatHelpers.getOrCreateRealmStat(
    lifeform.firstRealm
  );
  firstRealmStat.stakedCount = firstRealmStat.stakedCount.plus(ONE_BI);
  firstRealmStat.save();

  let secondRealmStat = RealmStatHelpers.getOrCreateRealmStat(
    lifeform.secondRealm
  );
  secondRealmStat.stakedCount = secondRealmStat.stakedCount.plus(ONE_BI);
  secondRealmStat.save();

  let treasureCollection = CollectionHelpers.getOrCreateCollection(
    SEED_OF_LIFE_TREASURES_ADDRESS
  );
  for (let i = 0; i < evolutionInfo.stakedTreasureIds.length; i++) {
    let tokenId = evolutionInfo.stakedTreasureIds[i];
    let token = TokenHelpers.getOrCreateToken(
      treasureCollection,
      tokenId,
      TreasureHelpers.getNameForTokenId(tokenId)
    );
    let stakedToken = new TokenQuantity(`${lifeform.id}-staked-${token.id}`);
    stakedToken.lifeform = lifeform.id;
    stakedToken.quantity = evolutionInfo.stakedTreasureAmounts[i];
    stakedToken.token = token.id;
    stakedToken.user = user.id;
    stakedToken.save();
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

  const random = RandomHelpers.getOrCreateRandom(params._requestId);

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

  const treasureCollection = CollectionHelpers.getOrCreateCollection(
    SEED_OF_LIFE_TREASURES_ADDRESS
  );
  for (let i = 0; i < params._brokenTreasureIds.length; i++) {
    const tokenId = params._brokenTreasureIds[i];
    let token = TokenHelpers.getOrCreateToken(
      treasureCollection,
      tokenId,
      TreasureHelpers.getNameForTokenId(tokenId)
    );
    const brokenToken = new TokenQuantity(`${lifeform.id}-broken-${token.id}`);
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

  const random = RandomHelpers.getOrCreateRandom(params._claimRequestId);

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

  const firstRealmStat = RealmStatHelpers.getOrCreateRealmStat(
    lifeform.firstRealm
  );
  firstRealmStat.stakedCount = firstRealmStat.stakedCount.minus(ONE_BI);
  firstRealmStat.save();

  const secondRealmStat = RealmStatHelpers.getOrCreateRealmStat(
    lifeform.secondRealm
  );
  secondRealmStat.stakedCount = secondRealmStat.stakedCount.minus(ONE_BI);
  secondRealmStat.save();

  store.remove("Lifeform", lifeform.id);
  store.remove("ClaimLifeformRequest", lifeform.id);
}
