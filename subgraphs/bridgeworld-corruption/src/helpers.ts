import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  CorruptionBuilding,
  CorruptionRemovalRecipe,
} from "../generated/schema";

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
