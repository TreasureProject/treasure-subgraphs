import { log } from "@graphprotocol/graph-ts";

import {
  NoRewardEarned,
  RewardClaimed,
  SmolStaked,
  SmolUnstaked,
  StartRacing,
  StopRacing,
} from "../../generated/Smol Racing/SmolRacing";
import { Claim, Random, Reward, StakedToken } from "../../generated/schema";
import { LOCATION_RACING } from "../helpers/constants";
import {
  getCollectionId,
  getRandomId,
  getRewardId,
  getStakedTokenId,
} from "../helpers/ids";
import { getOrCreateRewardToken } from "../helpers/models";
import { handleStake, handleUnstake } from "./common";

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;
  handleStake(
    params._owner,
    params._smolAddress,
    params._tokenId,
    LOCATION_RACING,
    params._stakeTime
  );
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;
  handleUnstake(params._smolAddress, params._tokenId, LOCATION_RACING);
}

export function handleStartRacing(event: StartRacing): void {
  const params = event.params;
  const stakedToken = handleStake(
    params._owner,
    params._vehicleAddress,
    params._tokenId,
    LOCATION_RACING,
    params._stakeTime
  );

  const randomId = getRandomId(params._requestId);
  const random = Random.load(randomId);
  if (!random) {
    log.error("[smol-racing] Unknown random request ID: {}", [randomId]);
    return;
  }

  const claimId = `${stakedToken.id}-${random.id}`;
  const claim = new Claim(claimId);
  claim.status = "Started";
  claim.startTime = event.block.timestamp;
  claim.rewards = [];
  claim.rewardsCount = params._totalRaces;
  claim.save();

  random._claimId = claim.id;
  random.save();

  stakedToken.claims = [claim.id];
  stakedToken._pendingClaimId = claim.id;
  stakedToken.save();
}

export function handleStopRacing(event: StopRacing): void {
  const params = event.params;
  handleUnstake(params._vehicleAddress, params._tokenId, LOCATION_RACING);
}

export function handleRewardClaimed(event: RewardClaimed): void {
  const params = event.params;

  const stakedTokenId = getStakedTokenId(
    getCollectionId(params._vehicleAddress),
    params._tokenId,
    LOCATION_RACING
  );
  const stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    log.error("[smol-racing] Unknown staked token: {}", [stakedTokenId]);
    return;
  }

  const claimId = stakedToken._pendingClaimId;
  if (!claimId) {
    log.error("[smol-racing] Unknown pending claim ID for staked token: {}", [
      stakedTokenId,
    ]);
    return;
  }

  const claim = Claim.load(claimId as string);
  if (!claim) {
    log.error("[smol-racing] Unknown pending claim for staked token: {}", [
      claimId as string,
    ]);
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

export function handleNoRewardEarned(event: NoRewardEarned): void {}
