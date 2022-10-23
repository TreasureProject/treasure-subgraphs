import { Address, BigInt } from "@graphprotocol/graph-ts";

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

export const getOrCreateCorruptionBuilding = (
  address: Address
): CorruptionBuilding => {
  let building = CorruptionBuilding.load(address);
  if (!building) {
    building = new CorruptionBuilding(address);
    building.address = address;
    building.ratePerSecond = BigInt.zero();
    building.generatedCorruptionCap = BigInt.zero();
    building.recipes = [];
    building.save();
  }

  return building;
};
