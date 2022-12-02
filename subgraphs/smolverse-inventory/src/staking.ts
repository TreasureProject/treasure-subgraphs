import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { SMOL_BODIES_ADDRESS, SMOL_BRAINS_ADDRESS } from "@treasure/constants";

import { DropGym, JoinGym } from "../generated/Smol Bodies Gym/Gym";
import { DropSchool, JoinSchool } from "../generated/Smol Brains School/School";
import { Token } from "../generated/schema";
import {
  getOrCreateUserToken,
  getStakingContract,
  getTokenId,
} from "./helpers";

const handleStake = (
  timestamp: BigInt,
  token: Token,
  user: Address,
  address: Address
): void => {
  const userToken = getOrCreateUserToken(token, user);
  const stakingContract = getStakingContract(address);
  if (!stakingContract) {
    log.error("Unknown staking contract: {}", [address.toHexString()]);
    return;
  }

  userToken.stakedIn = stakingContract.id;
  userToken.stakedTime = timestamp;
  userToken.save();
};

const handleUnstake = (token: Token, user: Address): void => {
  const userToken = getOrCreateUserToken(token, user);
  userToken.stakedIn = null;
  userToken.stakedTime = null;
  userToken.save();
};

export function handleJoinSchool(event: JoinSchool): void {
  const token = Token.load(
    getTokenId(SMOL_BRAINS_ADDRESS, event.params.tokenId)
  );
  if (!token) {
    log.error("Unknown token joining School: {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  handleStake(
    event.block.timestamp,
    token,
    event.transaction.from,
    event.address
  );
}

export function handleDropSchool(event: DropSchool): void {
  const token = Token.load(
    getTokenId(SMOL_BRAINS_ADDRESS, event.params.tokenId)
  );
  if (!token) {
    log.error("Unknown token dropping School: {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  handleUnstake(token, event.transaction.from);
}

export function handleJoinGym(event: JoinGym): void {
  const token = Token.load(
    getTokenId(SMOL_BODIES_ADDRESS, event.params.tokenId)
  );
  if (!token) {
    log.error("Unknown token joining Gym: {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  handleStake(
    event.block.timestamp,
    token,
    event.transaction.from,
    event.address
  );
}

export function handleDropGym(event: DropGym): void {
  const token = Token.load(
    getTokenId(SMOL_BODIES_ADDRESS, event.params.tokenId)
  );
  if (!token) {
    log.error("Unknown token dropping Gym: {}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  handleUnstake(token, event.transaction.from);
}
