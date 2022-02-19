import { log } from "@graphprotocol/graph-ts";

import { Claim, Random, Reward, StakedToken } from "../../generated/schema";
import { RewardClaimed, SmolStaked, SmolUnstaked, StartClaiming } from "../../generated/Smol Farm/SmolFarm";
import { LOCATION_FARM } from "../helpers/constants";
import { getCollectionId, getRandomId, getRewardId, getStakedTokenId } from "../helpers/ids";
import { getOrCreateRewardToken } from "../helpers/models";
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
  claim.rewards = [];
  claim.rewardsCount = params._numberRewards.toI32();
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
  
  // Create token and reward
  const token = getOrCreateRewardToken(params._claimedRewardId);
  const reward = new Reward(getRewardId(claim));
  reward.token = token.id;
  reward.save();

  // Add reward to this claim
  claim.rewards = claim.rewards.concat([reward.id]);

  // Complete claim if we've collected all rewards
  if (claim.rewards.length == claim.rewardsCount) {
    claim.status = "Claimed";
    stakedToken._pendingClaimId = null;
  }

  claim.save();
  stakedToken.save();
}
