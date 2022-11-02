import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";

import { TREASURE_CORRUPTION_HANDLER_ADDRESS } from "@treasure/constants";

import { CorruptionStreamModified } from "../generated/Corruption/Corruption";
import {
  CorruptionRemovalEnded,
  CorruptionRemovalRecipeAdded,
  CorruptionRemovalRecipeCreated,
  CorruptionRemovalRecipeRemoved,
  CorruptionRemovalStarted,
} from "../generated/CorruptionRemoval/CorruptionRemoval";
import { TreasureUnstaked } from "../generated/TreasureCorruptionHandler/TreasureCorruptionHandler";
import {
  Building,
  Recipe,
  RecipeItem,
  RecipeItemTreasureRequirement,
  Removal,
} from "../generated/schema";
import {
  ITEM_EFFECTS,
  ITEM_TYPES,
  TREASURE_CATEGORIES,
  decodeBigIntArray,
  getOrCreateBuilding,
  getOrCreateUser,
} from "./helpers";

export function handleCorruptionStreamModified(
  event: CorruptionStreamModified
): void {
  const params = event.params;
  const building = getOrCreateBuilding(params._account);
  building.ratePerSecond = params._ratePerSecond;
  building.generatedCorruptionCap = params._generatedCorruptionCap;
  building.save();
}

export function handleCorruptionRemovalRecipeCreated(
  event: CorruptionRemovalRecipeCreated
): void {
  const params = event.params;
  const recipe = new Recipe(Bytes.fromI32(params._recipeId.toI32()));
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
    const recipeItem = new RecipeItem(
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
    if (customHandler) {
      const requirementData = decodeBigIntArray(item.customRequirementData);
      recipeItem.customRequirementData = requirementData;
      if (
        customHandler.equals(TREASURE_CORRUPTION_HANDLER_ADDRESS) &&
        requirementData.length == 4
      ) {
        const treasureRequirement = new RecipeItemTreasureRequirement(
          recipeItem.id
        );
        treasureRequirement.item = recipeItem.id;
        treasureRequirement.tier = requirementData[0].toI32();
        treasureRequirement.category1 =
          TREASURE_CATEGORIES[requirementData[1].toI32()];
        treasureRequirement.category2 =
          TREASURE_CATEGORIES[requirementData[2].toI32()];
        treasureRequirement.amount = requirementData[3].toI32();
        treasureRequirement.save();
      }
    }

    recipeItem.save();
  }
}

export function handleCorruptionRemovalRecipeAdded(
  event: CorruptionRemovalRecipeAdded
): void {
  const params = event.params;
  const building = getOrCreateBuilding(params._buildingAddress);
  building.recipes = building.recipes.concat([
    Bytes.fromI32(params._recipeId.toI32()),
  ]);
  building.save();
}

export function handleCorruptionRemovalRecipeRemoved(
  event: CorruptionRemovalRecipeRemoved
): void {
  const params = event.params;
  const building = Building.load(params._buildingAddress);
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
  const removal = new Removal(Bytes.fromI32(params._requestId.toI32()));
  removal.user = getOrCreateUser(params._user).id;
  removal.building = params._buildingAddress;
  removal.recipe = Bytes.fromI32(params._recipeId.toI32());
  removal.status = "Started";
  removal.corruptionRemoved = BigInt.zero();
  removal.brokenTreasureIds = [];
  removal.brokenTreasureAmounts = [];
  removal.save();
}

export function handleCorruptionRemovalEnded(
  event: CorruptionRemovalEnded
): void {
  const params = event.params;
  const removal = Removal.load(Bytes.fromI32(params._requestId.toI32()));
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

export function handleTreasureUnstaked(event: TreasureUnstaked): void {
  const params = event.params;
  const removal = Removal.load(Bytes.fromI32(params._requestId.toI32()));
  if (!removal) {
    log.error("Unstaking Treasures from unknown Corruption removal: {}", [
      params._requestId.toHexString(),
    ]);
    return;
  }

  removal.brokenTreasureIds = params.brokenTreasureIds;
  removal.brokenTreasureAmounts = params.brokenTreasureAmounts;
  removal.save();
}
