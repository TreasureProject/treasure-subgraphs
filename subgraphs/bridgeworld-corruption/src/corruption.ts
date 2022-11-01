import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";

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
  CorruptionRemovalRecipe,
  CorruptionRemovalRecipeItem,
} from "../generated/schema";
import {
  ITEM_EFFECTS,
  ITEM_TYPES,
  getOrCreateCorruptionBuilding,
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
  const recipe = new CorruptionRemovalRecipe(
    Bytes.fromI32(params._recipeId.toI32())
  );
  recipe.corruptionRemoved = params._corruptionRemoved;
  recipe.save();

  for (let i = 0; i < params._items.length; i++) {
    const item = params._items[i];
    const address = item.itemAddress.notEqual(Address.zero())
      ? item.itemAddress
      : null;
    const customHandler = item.customHandler.notEqual(Address.zero())
      ? item.customHandler
      : null;
    if (!address && !customHandler) {
      log.error("[corruption] Skipping unknown removal recipe item: {}", [
        i.toString(),
      ]);
      continue;
    }

    const itemId = item.itemId.notEqual(BigInt.zero()) ? item.itemId : null;

    const addressId = (address || customHandler) as Address;
    const baseId = itemId ? addressId.concatI32(itemId.toI32()) : addressId;
    const recipeItem = new CorruptionRemovalRecipeItem(
      baseId.concatI32(event.block.number.toI32())
    );
    recipeItem.recipe = recipe.id;
    recipeItem.address = address;
    recipeItem.type = ITEM_TYPES[item.itemType];
    recipeItem.effect = ITEM_EFFECTS[item.itemEffect];
    recipeItem.effectChance = item.effectChance;
    recipeItem.itemId = itemId;
    recipeItem.amount = item.amount.notEqual(BigInt.zero())
      ? item.amount
      : null;
    recipeItem.customHandler = customHandler;
    recipeItem.customRequirementData = item.customRequirementData;
    recipeItem.save();
  }
}

export function handleCorruptionRemovalRecipeAdded(
  event: CorruptionRemovalRecipeAdded
): void {
  const params = event.params;
  const building = getOrCreateCorruptionBuilding(params._buildingAddress);
  building.recipes = building.recipes.concat([
    Bytes.fromI32(params._recipeId.toI32()),
  ]);
  building.save();
}

export function handleCorruptionRemovalRecipeRemoved(
  event: CorruptionRemovalRecipeRemoved
): void {
  const params = event.params;
  const building = CorruptionBuilding.load(params._buildingAddress);
  if (!building) {
    log.error("Removing recipe from unknown building: {}", [
      params._buildingAddress.toHexString(),
    ]);
    return;
  }

  const recipeId = Bytes.fromI32(params._recipeId.toI32());
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
  const removal = new CorruptionRemoval(
    Bytes.fromI32(params._requestId.toI32())
  );
  removal.user = getOrCreateUser(params._user).id;
  removal.building = params._buildingAddress;
  removal.recipe = Bytes.fromI32(params._recipeId.toI32());
  removal.status = "Started";
  removal.corruptionRemoved = BigInt.zero();
  removal.save();
}

export function handleCorruptionRemovalEnded(
  event: CorruptionRemovalEnded
): void {
  const params = event.params;
  const removal = CorruptionRemoval.load(
    Bytes.fromI32(params._requestId.toI32())
  );
  if (!removal) {
    log.error("Ending unknown Corruption removal: {}", [
      params._requestId.toHexString(),
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
