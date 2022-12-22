import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  CRAFTING_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import {
  Building,
  Config,
  CryptsBoardTreasureFragment,
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

export const SINGLETON_ID = Bytes.fromI32(1);

export const getOrCreateConfig = (): Config => {
  let config = Config.load(SINGLETON_ID);
  if (!config) {
    config = new Config(SINGLETON_ID);
    config.cryptsRound = -1;
    config.cryptsRoundStartTime = BigInt.zero();
    config.cryptsSecondsInEpoch = BigInt.zero();
    config.cryptsLegionsUnstakeCooldown = BigInt.zero();
    config.maxCryptsSquadsPerUser = 3;
    config.maxLegionsPerCryptsSquad = 20;
    config.maxCryptsMapTilesInHand = 60;
    config.maxCryptsMapTilesOnBoard = 20;
    config.save();
  }

  return config;
};

export const getOrCreateBoardTreasureFragment =
  (): CryptsBoardTreasureFragment => {
    let boardTreasureFragment = CryptsBoardTreasureFragment.load(SINGLETON_ID);
    if (!boardTreasureFragment) {
      boardTreasureFragment = new CryptsBoardTreasureFragment(SINGLETON_ID);
      boardTreasureFragment.tokenId = 0;
      boardTreasureFragment.positionX = -1;
      boardTreasureFragment.positionY = -1;
      boardTreasureFragment.save();
    }

    return boardTreasureFragment;
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

export const getOrCreateUserMapTile = (
  user: Bytes,
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

export const bytesFromBigInt = (bigInt: BigInt): Bytes =>
  Bytes.fromI32(bigInt.toI32());
