import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  CRAFTING_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import { Building, User } from "../generated/schema";

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

export const decodeBigIntArray = (data: Bytes): BigInt[] => {
  const dataString = data.toHexString().replace("0x", "");
  const decoded = ethereum.decode(`uint256[${dataString.length / 64}]`, data);
  return decoded ? decoded.toBigIntArray() : [];
};
