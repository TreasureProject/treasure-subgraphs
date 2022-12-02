import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import {
  BATTLEFLY_SMOLVERSE_FLYWHEEL_VAULT_ADDRESS,
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_GYM_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
  SMOL_BRAINS_SCHOOL_ADDRESS,
  SMOL_CARS_ADDRESS,
  SMOL_FARM_ADDRESS,
  SMOL_RACING_ADDRESS,
  SMOL_RACING_TROPHIES_ADDRESS,
  SMOL_ROCKET_ADDRESS,
  SMOL_TREASURES_ADDRESS,
  SWOLERCYCLES_ADDRESS,
  WRAPPED_SMOLS_ADDRESS,
} from "@treasure/constants";

import {
  Collection,
  StakingContract,
  Token,
  User,
  UserToken,
} from "../generated/schema";

export const getCollectionName = (address: Address): string => {
  if (address.equals(SMOL_BRAINS_ADDRESS)) {
    return "SmolBrains";
  }

  if (address.equals(SMOL_BODIES_ADDRESS)) {
    return "SmolBodies";
  }

  if (address.equals(SMOL_BRAINS_PETS_ADDRESS)) {
    return "SmolBrainsPets";
  }

  if (address.equals(SMOL_BODIES_PETS_ADDRESS)) {
    return "SmolBodiesPets";
  }

  if (address.equals(SMOL_BRAINS_LAND_ADDRESS)) {
    return "SmolLand";
  }

  if (address.equals(SMOL_CARS_ADDRESS)) {
    return "SmolCars";
  }

  if (address.equals(SWOLERCYCLES_ADDRESS)) {
    return "Swolercycles";
  }

  if (address.equals(SMOL_RACING_TROPHIES_ADDRESS)) {
    return "SmolRacingTrophies";
  }

  if (address.equals(SMOL_TREASURES_ADDRESS)) {
    return "SmolTreasures";
  }

  return "Other";
};

export const getOrCreateCollection = (address: Address): Collection => {
  let collection = Collection.load(address);
  if (!collection) {
    collection = new Collection(address);
    collection.name = getCollectionName(address);
    collection.save();
  }

  return collection;
};

export const getStakingContractName = (address: Address): string | null => {
  if (address.equals(BATTLEFLY_SMOLVERSE_FLYWHEEL_VAULT_ADDRESS)) {
    return "BattleFlyFlywheel";
  }

  if (address.equals(SMOL_FARM_ADDRESS)) {
    return "Farm";
  }

  if (address.equals(SMOL_BODIES_GYM_ADDRESS)) {
    return "Gym";
  }

  if (address.equals(WRAPPED_SMOLS_ADDRESS)) {
    return "Quests";
  }

  if (address.equals(SMOL_RACING_ADDRESS)) {
    return "Racing";
  }

  if (address.equals(SMOL_ROCKET_ADDRESS)) {
    return "Rocket";
  }

  if (address.equals(SMOL_BRAINS_SCHOOL_ADDRESS)) {
    return "School";
  }

  return null;
};

export const getStakingContract = (
  address: Address
): StakingContract | null => {
  let stakingContract = StakingContract.load(address);
  if (stakingContract) {
    return stakingContract;
  }

  const name = getStakingContractName(address);
  if (!name) {
    return null;
  }

  stakingContract = new StakingContract(address);
  stakingContract.name = name as string;
  stakingContract.save();
  return stakingContract;
};

export const getTokenId = (address: Address, tokenId: BigInt): Bytes =>
  address.concatI32(tokenId.toI32());

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.save();
  }

  return user;
};

export const getOrCreateUserToken = (
  token: Token,
  owner: Address
): UserToken => {
  const id = token.id.concat(owner);
  let userToken = UserToken.load(id);
  if (!userToken) {
    userToken = new UserToken(id);
    userToken.token = token.id;
    userToken.collection = token.collection;
    userToken.owner = getOrCreateUser(owner).id;
    userToken.quantity = 0;
    userToken.save();
  }

  return userToken;
};
