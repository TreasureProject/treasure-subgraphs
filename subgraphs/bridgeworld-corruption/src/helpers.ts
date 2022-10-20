import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  CorruptionBuilding,
  CorruptionRemovalRecipe,
  User,
} from "../generated/schema";

export const ITEM_TYPES = ["ERC20", "ERC1155"];

export const ITEM_EFFECTS = ["Burn", "MoveToTreasury", "Custom"];

export const getOrCreateUser = (address: Address): User => {
  const id = address.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
};

export const getOrCreateCorruptionBuilding = (
  address: Address
): CorruptionBuilding => {
  const id = address.toHexString();
  let building = CorruptionBuilding.load(id);
  if (!building) {
    building = new CorruptionBuilding(id);
    building.address = address;
    building.ratePerSecond = BigInt.zero();
    building.generatedCorruptionCap = BigInt.zero();
    building.recipes = [];
    building.save();
  }

  return building;
};

export const getOrCreateCorruptionRemovalRecipe = (
  recipeId: BigInt
): CorruptionRemovalRecipe => {
  const id = recipeId.toString();
  let recipe = CorruptionRemovalRecipe.load(id);
  if (!recipe) {
    recipe = new CorruptionRemovalRecipe(id);
    recipe.corruptionRemoved = BigInt.zero();
    recipe.save();
  }

  return recipe;
};
