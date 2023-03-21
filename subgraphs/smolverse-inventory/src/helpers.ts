import { Address, BigInt, Bytes, TypedMap } from "@graphprotocol/graph-ts";

import {
  BATTLEFLY_SMOLVERSE_FLYWHEEL_VAULT_ADDRESS,
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_GYM_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
  SMOL_BRAINS_SCHOOL_ADDRESS,
  SMOL_BRAINS_SCHOOL_V2_ADDRESS,
  SMOL_BRAINS_V2_ADDRESS,
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

const COLLECTION_NAMES = new TypedMap<Address, string>();
COLLECTION_NAMES.set(SMOL_BRAINS_ADDRESS, "SmolBrains");
COLLECTION_NAMES.set(SMOL_BRAINS_V2_ADDRESS, "SmolBrains");
COLLECTION_NAMES.set(SMOL_BODIES_ADDRESS, "SmolBodies");
COLLECTION_NAMES.set(SMOL_BRAINS_PETS_ADDRESS, "SmolBrainsPets");
COLLECTION_NAMES.set(SMOL_BODIES_PETS_ADDRESS, "SmolBodiesPets");
COLLECTION_NAMES.set(SMOL_BRAINS_LAND_ADDRESS, "SmolLand");
COLLECTION_NAMES.set(SMOL_CARS_ADDRESS, "SmolCars");
COLLECTION_NAMES.set(SWOLERCYCLES_ADDRESS, "Swolercycles");
COLLECTION_NAMES.set(SMOL_RACING_TROPHIES_ADDRESS, "SmolRacingTrophies");
COLLECTION_NAMES.set(SMOL_TREASURES_ADDRESS, "SmolTreasures");

const STAKING_CONTRACT_NAMES = new TypedMap<Address, string>();
STAKING_CONTRACT_NAMES.set(
  BATTLEFLY_SMOLVERSE_FLYWHEEL_VAULT_ADDRESS,
  "BattleFlyFlywheel"
);
STAKING_CONTRACT_NAMES.set(SMOL_FARM_ADDRESS, "Farm");
STAKING_CONTRACT_NAMES.set(SMOL_BODIES_GYM_ADDRESS, "Gym");
STAKING_CONTRACT_NAMES.set(WRAPPED_SMOLS_ADDRESS, "Quests");
STAKING_CONTRACT_NAMES.set(SMOL_RACING_ADDRESS, "Racing");
STAKING_CONTRACT_NAMES.set(SMOL_ROCKET_ADDRESS, "Rocket");
STAKING_CONTRACT_NAMES.set(SMOL_BRAINS_SCHOOL_ADDRESS, "School");
STAKING_CONTRACT_NAMES.set(SMOL_BRAINS_SCHOOL_V2_ADDRESS, "School");

export const SMOLS_BURN_ADDRESS = Address.fromHexString(
  "0x000000000000000000000000000000000000dead"
);

export const getCollectionName = (address: Address): string => {
  const name = COLLECTION_NAMES.get(address);
  return name ? name : "Other";
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

export const getStakingContractName = (address: Address): string | null =>
  STAKING_CONTRACT_NAMES.get(address);

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
    userToken.tokenId = token.tokenId;
    userToken.owner = getOrCreateUser(owner).id;
    userToken.quantity = 0;
    userToken.save();
  }

  return userToken;
};
