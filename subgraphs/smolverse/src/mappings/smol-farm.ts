import { store } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { log } from "matchstick-as";

import { Claim, Farm, Random, StakedToken } from "../../generated/schema";
import { RewardClaimed, SmolStaked, SmolUnstaked, StartClaiming } from "../../generated/Smol Farm/SmolFarm";
import { SMOL_BRAINS_COLLECTION_NAME, SMOL_FARM_NAME, TOKEN_STANDARD_ERC721 } from "../helpers/constants";
import { getFarmId, getRandomId, getStakedTokenId } from "../helpers/ids";
import { getOrCreateCollection, getOrCreateFarm, getOrCreateToken, getOrCreateUser } from "../helpers/models";

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;

  const farm = getOrCreateFarm(event.address, SMOL_FARM_NAME);
  const owner = getOrCreateUser(params._owner.toHexString());
  const collection = getOrCreateCollection(SMOL_BRAINS_ADDRESS, SMOL_BRAINS_COLLECTION_NAME, TOKEN_STANDARD_ERC721);
  const token = getOrCreateToken(collection, params._tokenId);

  const stakedToken = new StakedToken(getStakedTokenId(token, farm));
  stakedToken.token = token.id;
  stakedToken.farm = farm.id;
  stakedToken.owner = owner.id;
  stakedToken.stakeTime = params._stakeTime;
  stakedToken.claims = [];
  stakedToken.save();
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;

  const id = [
    SMOL_BRAINS_ADDRESS.toHexString(),
    params._tokenId.toHexString(),
    getFarmId(event.address)
  ].join("-");
  const stakedToken = StakedToken.load(id);
  if (!stakedToken) {
    log.info("[smol-farm] Skipped already removed staked token: {}", [id]);
    return;
  }

  for (let index = 0; index < stakedToken.claims.length; index++) {
    store.remove("Claim", stakedToken.claims[index]);
  }

  store.remove("StakedToken", id);
}

export function handleStartClaiming(event: StartClaiming): void {
  const params = event.params;

  const stakedTokenId = [
    SMOL_BRAINS_ADDRESS.toHexString(),
    params._tokenId.toHexString(),
    getFarmId(event.address)
  ].join("-");
  const stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    log.error("[smol-farm] Unknown staked token: {}", [stakedTokenId]);
    return;
  }

  const randomId = getRandomId(params._requestId);
  const random = Random.load(randomId);
  if (!random) {
    log.error("[smol-farm] Unknown random request ID: {}", [randomId]);
    return;
  }

  const claimId = `${stakedTokenId}-${random.id}`;
  const claim = new Claim(claimId);
  claim.status = "Started";
  claim.save();

  random._claimId = claim.id;
  random.save();

  stakedToken.claims = stakedToken.claims.concat([claim.id]);
  stakedToken._pendingClaimId = claim.id;
  stakedToken.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  const params = event.params;

  const stakedTokenId = [
    SMOL_BRAINS_ADDRESS.toHexString(),
    params._tokenId.toHexString(),
    getFarmId(event.address)
  ].join("-");
  const stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    log.error("[smol-farm] Unknown staked token: {}", [stakedTokenId]);
    return;
  }

  const claimId = stakedToken._pendingClaimId;
  if (!claimId) {
    log.error("[smol-farm] Unknown pending claim ID for staked token: {}", [stakedTokenId]);
    return;
  }

  const claim = Claim.load(claimId as string);
  if (!claim) {
    log.error("[smol-farm] Unknown pending claim for staked token: {}", [claimId as string]);
    return;
  }

  claim.status = "Claimed";
  claim.save();

  stakedToken._pendingClaimId = null;
  stakedToken.save();
}
