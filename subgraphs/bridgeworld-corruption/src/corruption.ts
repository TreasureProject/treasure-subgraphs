import { BigInt, log } from "@graphprotocol/graph-ts";

import { CorruptionStreamModified } from "../generated/Corruption/Corruption";
import {
  CorruptionRemovalEnded,
  CorruptionRemovalRecipeAdded,
  CorruptionRemovalRecipeCreated,
  CorruptionRemovalRecipeRemoved,
  CorruptionRemovalStarted,
} from "../generated/CorruptionRemoval/CorruptionRemoval";
import { CorruptionBuilding, CorruptionRemoval } from "../generated/schema";
import {
  getOrCreateCorruptionBuilding,
  getOrCreateCorruptionRemovalRecipe,
} from "./helpers";

export function handleCorruptionStreamModified(
  event: CorruptionStreamModified
): void {
  const params = event.params;
  const building = getOrCreateCorruptionBuilding(params._account);
  building.ratePerSecond = params._ratePerSecond;
  building.generatedCorruptionCap = params._generatedCorruptionCap;
  building.save();
}

export function handleCorruptionRemovalRecipeCreated(
  event: CorruptionRemovalRecipeCreated
): void {
  const params = event.params;
  const recipe = getOrCreateCorruptionRemovalRecipe(params._recipeId);
  recipe.corruptionRemoved = params._corruptionRemoved;
  recipe.save();
}

export function handleCorruptionRemovalRecipeAdded(
  event: CorruptionRemovalRecipeAdded
): void {
  const params = event.params;
  const building = CorruptionBuilding.load(
    params._buildingAddress.toHexString()
  );
  if (!building) {
    log.error("Adding recipe to unknown building: {}", [
      params._buildingAddress.toHexString(),
    ]);
    return;
  }

  building.recipes = building.recipes.concat([params._recipeId.toString()]);
  building.save();
}

export function handleCorruptionRemovalRecipeRemoved(
  event: CorruptionRemovalRecipeRemoved
): void {
  const params = event.params;
  const building = CorruptionBuilding.load(
    params._buildingAddress.toHexString()
  );
  if (!building) {
    log.error("Removing recipe from unknown building: {}", [
      params._buildingAddress.toHexString(),
    ]);
    return;
  }

  const recipeId = params._recipeId.toString();
  for (let i = 0; i < building.recipes.length; i++) {
    if (building.recipes[i] == recipeId) {
      building.recipes = building.recipes
        .slice(0, i)
        .concat(building.recipes.slice(i + 1));
      break;
    }
  }

  building.save();
}

export function handleCorruptionRemovalStarted(
  event: CorruptionRemovalStarted
): void {
  const params = event.params;
  const removal = new CorruptionRemoval(params._requestId.toString());
  removal.user = params._user;
  removal.building = params._buildingAddress.toHexString();
  removal.recipe = params._recipeId.toString();
  removal.status = "Started";
  removal.corruptionRemoved = BigInt.zero();
  removal.save();
}

export function handleCorruptionRemovalEnded(
  event: CorruptionRemovalEnded
): void {
  const params = event.params;
  const removal = CorruptionRemoval.load("");
  if (!removal) {
    log.error("Ending unknown Corruption removal: {}", [""]);
    return;
  }

  removal.status = "Finished";
  removal.corruptionRemoved = params._corruptionRemoved;
  if (params._prismMinted.gt(BigInt.zero())) {
    removal.prismMinted = params._prismMinted;
  }

  removal.save();
}
