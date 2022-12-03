import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  CRAFTING_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import {
  Building,
  Config,
  CryptsUserEpoch,
  CryptsUserMapTile,
  User,
} from "../generated/schema";

export const ITEM_TYPES = ["ERC20", "ERC1155"];

export const ITEM_EFFECTS = ["Burn", "MoveToTreasury", "Custom"];

export const TREASURE_CATEGORIES = [
  "Alchemy",
  "Arcana",
  "Brewing",
  "Enchanting",
  "Leatherworking",
  "Smithing",
];

export const CONFIG_ID = Bytes.fromI32(1);

export const getOrCreateConfig = (): Config => {
  let config = Config.load(CONFIG_ID);
  if (!config) {
    config = new Config(CONFIG_ID);
    config.save();
  }

  return config;
};

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
    user.save();
  }

  return user;
};

export const getBuildingType = (address: Address): string => {
  if (address.equals(CRAFTING_ADDRESS)) {
    return "theforge";
  }

  if (address.equals(ADVANCED_QUESTING_ADDRESS)) {
    return "ivorytower";
  }

  if (address.equals(SUMMONING_ADDRESS)) {
    return "summoningcircle";
  }

  // TODO: Check if address is a Harvester
  // return "Harvesters";

  return "other";
};

export const getOrCreateBuilding = (address: Address): Building => {
  let building = Building.load(address);
  if (!building) {
    building = new Building(address);
    building.type = getBuildingType(address);
    building.address = address;
    building.ratePerSecond = BigInt.zero();
    building.generatedCorruptionCap = BigInt.zero();
    building.recipes = [];
    building.save();
  }

  return building;
};

export const getOrCreateUserEpoch = (
  user: Address,
  epoch: i32
): CryptsUserEpoch => {
  const id = user.concatI32(epoch);
  let userEpoch = CryptsUserEpoch.load(id);
  if (!userEpoch) {
    userEpoch = new CryptsUserEpoch(id);
    userEpoch.user = user;
    userEpoch.epoch = epoch;
    userEpoch.mapTiles = [];
    userEpoch.save();
  }

  return userEpoch;
};

export const getOrCreateUserMapTile = (
  user: Address,
  mapTile: Bytes
): CryptsUserMapTile => {
  const id = user.concat(mapTile);
  let userMapTile = CryptsUserMapTile.load(id);
  if (!userMapTile) {
    userMapTile = new CryptsUserMapTile(id);
    userMapTile.user = user;
    userMapTile.mapTile = mapTile;
    userMapTile.positionX = -1;
    userMapTile.positionY = -1;
    userMapTile.save();
  }

  return userMapTile;
};

export const decodeBigIntArray = (data: Bytes): BigInt[] => {
  const dataString = data.toHexString().replace("0x", "");
  const decoded = ethereum.decode(`uint256[${dataString.length / 64}]`, data);
  return decoded ? decoded.toBigIntArray() : [];
};

export const bigNumberToBytes = (bigInt: BigInt): Bytes =>
  Bytes.fromI32(bigInt.toI32());
