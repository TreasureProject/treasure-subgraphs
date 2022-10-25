import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ADVANCED_QUESTING_ADDRESS,
  CRAFTING_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import { CorruptionBuilding, User } from "../generated/schema";

export const ITEM_TYPES = ["ERC20", "ERC1155"];

export const ITEM_EFFECTS = ["Burn", "MoveToTreasury", "Custom"];

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
    return "TheForge";
  }

  if (address.equals(ADVANCED_QUESTING_ADDRESS)) {
    return "IvoryTower";
  }

  if (address.equals(SUMMONING_ADDRESS)) {
    return "SummoningCircle";
  }

  // TODO: Check if address is a Harvester
  // return "Harvesters";

  return "Other";
};

export const getOrCreateCorruptionBuilding = (
  address: Address
): CorruptionBuilding => {
  let building = CorruptionBuilding.load(address);
  if (!building) {
    building = new CorruptionBuilding(address);
    building.type = getBuildingType(address);
    building.address = address;
    building.ratePerSecond = BigInt.zero();
    building.generatedCorruptionCap = BigInt.zero();
    building.recipes = [];
    building.save();
  }

  return building;
};
