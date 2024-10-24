import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import {
  Claim,
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Subscribe,
  Unstake,
  Unsubscribe,
} from "../../generated/StakingContract/StakingContract";
import {
  Incentive,
  Pair,
  Token,
  UserIncentive,
  UserIncentiveClaim,
  UserStake,
} from "../../generated/schema";
import { getOrCreateUser } from "../helpers";

export function handleIncentiveCreated(event: IncentiveCreated): void {
  const params = event.params;
  const pair = Pair.load(params.token);
  if (!pair) {
    // Ignoring incentive for unknown token
    return;
  }

  const incentive = new Incentive(Bytes.fromI32(params.id.toI32()));
  incentive.incentiveId = params.id;
  incentive.pair = pair.id;
  incentive.creator = params.creator;
  incentive.rewardTokenAddress = params.rewardToken;
  incentive.rewardAmount = params.amount;
  incentive.isRewardRounded = false;
  incentive.startTime = params.startTime;
  incentive.endTime = params.endTime;
  incentive.remainingRewardAmount = params.amount;

  const rewardToken = Token.load(params.rewardToken);
  if (rewardToken) {
    incentive.rewardToken = rewardToken.id;
  }

  incentive.save();
}

export function handleIncentiveUpdated(event: IncentiveUpdated): void {
  const params = event.params;
  const incentive = Incentive.load(Bytes.fromI32(params.id.toI32()));
  if (!incentive) {
    // Ignoring update for unknown incentive
    return;
  }

  incentive.rewardAmount = incentive.rewardAmount.plus(params.changeAmount);
  incentive.startTime = params.newStartTime;
  incentive.endTime = params.newEndTime;
  incentive.save();
}

export function handleStake(event: Stake): void {
  const params = event.params;
  const pair = Pair.load(params.token);
  if (!pair) {
    // Ignoring stake for unknown token
    return;
  }

  const stakeId = params.token.concat(params.user);
  let stake = UserStake.load(stakeId);
  if (!stake) {
    stake = new UserStake(stakeId);
    stake.user = getOrCreateUser(params.user).id;
    stake.pair = params.token;
    stake.amount = BigInt.zero();
  }

  stake.amount = stake.amount.plus(params.amount);
  stake.save();
}

export function handleUnstake(event: Unstake): void {
  const params = event.params;
  const stake = UserStake.load(params.token.concat(params.user));
  if (!stake) {
    // Ignoring unstake for unknown stake
    return;
  }

  stake.amount = stake.amount.minus(params.amount);
  stake.save();
}

export function handleSubscribe(event: Subscribe): void {
  const params = event.params;
  const incentive = Incentive.load(Bytes.fromI32(params.id.toI32()));
  if (!incentive) {
    // Ignoring subscription for unknown incentive
    return;
  }

  const userIncentiveId = incentive.id.concat(params.user);
  let userIncentive = UserIncentive.load(userIncentiveId);
  if (!userIncentive) {
    userIncentive = new UserIncentive(userIncentiveId);
    userIncentive.user = getOrCreateUser(params.user).id;
    userIncentive.incentive = incentive.id;
  }

  userIncentive.isSubscribed = true;
  userIncentive.save();
}

export function handleUnsubscribe(event: Unsubscribe): void {
  const params = event.params;
  const userIncentive = UserIncentive.load(
    Bytes.fromI32(params.id.toI32()).concat(params.user)
  );
  if (!userIncentive) {
    // Ignoring unsubscription for unknown user incentive
    return;
  }

  userIncentive.isSubscribed = false;
  userIncentive.save();
}

export function handleClaim(event: Claim): void {
  const params = event.params;
  const userIncentive = UserIncentive.load(
    Bytes.fromI32(params.id.toI32()).concat(params.user)
  );
  if (!userIncentive) {
    // Ignoring claim for unknown user incentive
    return;
  }

  const incentive = Incentive.load(userIncentive.incentive);
  if (!incentive) {
    // Ignoring claim for unknown incentive
    return;
  }

  const claim = new UserIncentiveClaim(
    event.transaction.hash.concatI32(event.transactionLogIndex.toI32())
  );
  claim.userIncentive = userIncentive.id;
  claim.timestamp = event.block.timestamp;
  claim.amount = params.amount;
  claim.save();

  incentive.remainingRewardAmount = incentive.remainingRewardAmount.minus(
    params.amount
  );
  incentive.save();
}
