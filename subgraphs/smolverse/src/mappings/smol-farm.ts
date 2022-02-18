import { log } from "@graphprotocol/graph-ts";
import { SMOL_TREASURES_ADDRESS } from "@treasure/constants";

import { Claim, Random, StakedToken } from "../../generated/schema";
import { RewardClaimed, SmolStaked, SmolUnstaked, StartClaiming } from "../../generated/Smol Farm/SmolFarm";
import { LOCATION_FARM } from "../helpers/constants";
import { getCollectionId, getRandomId, getStakedTokenId } from "../helpers/ids";
import { getOrCreateCollection, getOrCreateFarmRewardToken, getOrCreateToken } from "../helpers/models";
import { handleStake, handleUnstake } from "./common";

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;
  handleStake(
    params._owner,
    params._smolAddress,
    params._tokenId,
    LOCATION_FARM,
    params._stakeTime
  );
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;
  handleUnstake(
    params._smolAddress,
    params._tokenId,
    LOCATION_FARM
  );
}

export function handleStartClaiming(event: StartClaiming): void {
  const params = event.params;

  const stakedTokenId = getStakedTokenId(
    getCollectionId(params._smolAddress),
    params._tokenId,
    LOCATION_FARM
  );
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
  claim.startTime = event.block.timestamp;
  claim.save();

  random._claimId = claim.id;
  random.save();

  const claims = (stakedToken.claims || []) as string[];
  stakedToken.claims = claims.concat([claim.id]);
  stakedToken._pendingClaimId = claim.id;
  stakedToken.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  const params = event.params;

  const stakedTokenId = getStakedTokenId(
    getCollectionId(params._smolAddress),
    params._tokenId,
    LOCATION_FARM
  );
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

  const reward = getOrCreateFarmRewardToken(params._claimedRewardId);
  claim.status = "Claimed";
  claim.reward = reward.id;
  claim.save();

  stakedToken._pendingClaimId = null;
  stakedToken.save();
}
