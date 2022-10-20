import { BigInt, log } from "@graphprotocol/graph-ts";

import { CorruptionStreamModified } from "../generated/Corruption/Corruption";
import {
  CorruptionRemovalEnded,
  CorruptionRemovalRecipeAdded,
  CorruptionRemovalRecipeCreated,
  CorruptionRemovalRecipeRemoved,
  CorruptionRemovalStarted,
} from "../generated/CorruptionRemoval/CorruptionRemoval";
import {
  CorruptionBuilding,
  CorruptionRemoval,
  CorruptionRemovalRecipeItem,
} from "../generated/schema";
import {
  ITEM_EFFECTS,
  ITEM_TYPES,
  getOrCreateCorruptionBuilding,
  getOrCreateCorruptionRemovalRecipe,
  getOrCreateUser,
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

  for (let i = 0; i < params._items.length; i++) {
    const item = params._items[i];
    const recipeItem = new CorruptionRemovalRecipeItem(
      `${item.itemAddress.toHexString()}-${item.itemId.toString()}`
    );
    recipeItem.recipe = recipe.id;
    recipeItem.address = item.itemAddress;
    recipeItem.type = ITEM_TYPES[item.itemType];
    recipeItem.effect = ITEM_EFFECTS[item.itemEffect];
    recipeItem.effectChance = item.effectChance;
    recipeItem.itemId = item.itemId;
    recipeItem.amount = item.amount;
    recipeItem.customHandler = item.customHandler;
    recipeItem.customRequirementData = item.customRequirementData;
    recipeItem.save();
  }
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
  removal.user = getOrCreateUser(params._user).id;
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
  const removal = CorruptionRemoval.load(params._requestId.toString());
  if (!removal) {
    log.error("Ending unknown Corruption removal: {}", [
      params._requestId.toString(),
    ]);
    return;
  }

  removal.status = "Finished";
  removal.corruptionRemoved = params._corruptionRemoved;
  if (params._prismMinted.gt(BigInt.zero())) {
    removal.prismMinted = params._prismMinted;
  }

  removal.save();
}
