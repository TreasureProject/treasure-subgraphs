import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";

import {
  SMOL_BODIES_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_CARS_ADDRESS,
  SMOL_RACING_TROPHIES_ADDRESS,
  SWOLERCYCLES_ADDRESS,
} from "@treasure/constants";

import {
  NoRewardEarned,
  RewardClaimed,
  SmolStaked,
  SmolUnstaked,
  StartRacing,
  StopRacing,
} from "../../generated/Smol Racing/SmolRacing";
import {
  Driver,
  Race,
  Random,
  Reward,
  Token,
  VehicleRace,
} from "../../generated/schema";

const getTokenType = (contract: Address): string => {
  if (contract.equals(SMOL_BODIES_ADDRESS)) {
    return "SmolBodies";
  }

  if (contract.equals(SMOL_CARS_ADDRESS)) {
    return "SmolCars";
  }

  if (contract.equals(SWOLERCYCLES_ADDRESS)) {
    return "Swolercycles";
  }

  return "SmolBrains";
};

const getEventId = (event: ethereum.Event): string =>
  `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`;

const getTokenId = (contract: Address, tokenId: BigInt): string =>
  `${contract.toHexString()}-${tokenId.toString()}`;

const getRaceId = getEventId;

const getRewardId = getEventId;

const getOrCreateToken = (contract: Address, tokenId: BigInt): Token => {
  const id = getTokenId(contract, tokenId);
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.type = getTokenType(contract);
    token.contract = contract;
    token.tokenId = tokenId;
    token.save();
  }

  return token;
};

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;
  const token = getOrCreateToken(params._smolAddress, params._tokenId);
  token.isStaked = true;
  token.stakingUser = params._owner;
  token.save();
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;

  const id = getTokenId(params._smolAddress, params._tokenId);
  const token = Token.load(id);
  if (!token) {
    log.error("[smol-racing] Unstaking unknown Token: {}", [id]);
    return;
  }

  token.isStaked = false;
  token.stakingUser = null;
  token.save();
}

export function handleStartRacing(event: StartRacing): void {
  const params = event.params;
  const requestId = params._requestId;
  const vehicleContract = params._vehicleAddress;
  const driverIds = params._driverIds;

  const random = Random.load(requestId.toString());
  if (!random) {
    log.error("[smol-racing]: Unknown Random: {}", [requestId.toString()]);
    return;
  }

  const vehicle = getOrCreateToken(vehicleContract, params._tokenId);
  vehicle.isStaked = true;
  vehicle.save();

  const race = new Race(getRaceId(event));
  race.user = params._owner;
  race.startTime = params._stakeTime;
  race.numRaces = params._totalRaces;
  race.status = "Started";
  race.vehicle = vehicle.id;
  race.save();

  for (let i = 0; i < driverIds.length; i++) {
    const token = getOrCreateToken(
      vehicleContract.equals(SWOLERCYCLES_ADDRESS)
        ? SMOL_BODIES_ADDRESS
        : SMOL_BRAINS_ADDRESS,
      driverIds[i]
    );
    const driver = new Driver(`${race.id}-${token.id}`);
    driver.race = race.id;
    driver.token = token.id;
    driver.save();
  }

  random.race = race.id;
  random.save();

  let vehicleRace = VehicleRace.load(vehicle.id);
  if (!vehicleRace) {
    vehicleRace = new VehicleRace(vehicle.id);
    vehicleRace.vehicle = vehicle.id;
  }

  vehicleRace.race = race.id;
  vehicleRace.save();
}

export function handleStopRacing(event: StopRacing): void {
  const params = event.params;
  const unstakeTime = params._stakeTime;

  const vehicleId = getTokenId(params._vehicleAddress, params._tokenId);
  const vehicle = Token.load(vehicleId);
  if (!vehicle) {
    log.error("[smol-racing] Stopping unknown Vehicle: {}", [vehicleId]);
    return;
  }

  const vehicleRace = VehicleRace.load(vehicleId);
  if (!vehicleRace || !vehicleRace.race) {
    log.error("[smol-racing] Stopping Race for unknown Vehicle: {}", [
      vehicleId,
    ]);
    return;
  }

  const race = Race.load(vehicleRace.race as string);
  if (!race) {
    log.error("[smol-racing] Stopping unknown Race: {}", [
      vehicleRace.race as string,
    ]);
    return;
  }

  vehicle.isStaked = false;
  vehicle.save();

  race.endTime = unstakeTime;
  race.status = "Stopped";
  race.save();

  vehicleRace.race = null;
  vehicleRace.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  const params = event.params;

  const vehicleId = getTokenId(params._vehicleAddress, params._tokenId);
  const vehicleRace = VehicleRace.load(vehicleId);
  if (!vehicleRace || !vehicleRace.race) {
    log.error(
      "[smol-racing] Claiming rewards from Race for unknown Vehicle: {}",
      [vehicleId]
    );
    return;
  }

  const race = Race.load(vehicleRace.race as string);
  if (!race) {
    log.error("[smol-racing] Claiming rewards from unknown Race: {}", [
      vehicleRace.race as string,
    ]);
    return;
  }

  const reward = new Reward(getRewardId(event));
  reward.race = race.id;
  reward.timestamp = event.block.timestamp;
  reward.contract = SMOL_RACING_TROPHIES_ADDRESS;
  reward.tokenId = params._claimedRewardId;
  reward.amount = params._amount;
  reward.save();
}

export function handleNoRewardEarned(event: NoRewardEarned): void {
  const params = event.params;

  const vehicleId = getTokenId(params._vehicleAddress, params._tokenId);
  const vehicleRace = VehicleRace.load(vehicleId);
  if (!vehicleRace || !vehicleRace.race) {
    log.error(
      "[smol-racing] Claiming empty rewards from Race for unknown Vehicle: {}",
      [vehicleId]
    );
    return;
  }

  const race = Race.load(vehicleRace.race as string);
  if (!race) {
    log.error("[smol-racing] Claiming empty rewards from unknown Race: {}", [
      vehicleRace.race as string,
    ]);
    return;
  }

  const reward = new Reward(getRewardId(event));
  reward.race = race.id;
  reward.timestamp = event.block.timestamp;
  reward.amount = BigInt.zero();
  reward.save();
}
