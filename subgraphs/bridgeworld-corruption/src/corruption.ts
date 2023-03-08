import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";

import {
  ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ADDRESS,
  TREASURE_CORRUPTION_HANDLER_ADDRESS,
} from "@treasure/constants";

import {
  CorruptionStreamBoostModified,
  CorruptionStreamModified,
} from "../generated/Corruption/Corruption";
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
  RecipeItemERC1155Requirement,
  RecipeItemTreasureRequirement,
  Removal,
} from "../generated/schema";
import {
  ITEM_EFFECTS,
  ITEM_TYPES,
  decodeERC1155TokenSetHandlerRequirementData,
  decodeTreasureHandlerRequirementData,
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

export function handleCorruptionStreamBoostModified(
  event: CorruptionStreamBoostModified
): void {
  const params = event.params;
  const building = getOrCreateBuilding(params._account);
  building.boost = params._boost;
  building.save();
}

export function handleCorruptionRemovalRecipeCreated(
  event: CorruptionRemovalRecipeCreated
): void {
  const params = event.params;
  const recipe = new Recipe(Bytes.fromI32(params._recipeId.toI32()));
  recipe.recipeId = params._recipeId;
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
      recipeItem.customRequirementData = item.customRequirementData;
      if (customHandler.equals(TREASURE_CORRUPTION_HANDLER_ADDRESS)) {
        const data = decodeTreasureHandlerRequirementData(
          item.customRequirementData
        );
        if (!data) {
          log.error(
            "Error decoding Treasure Corruption Handler requirement data",
            []
          );
          return;
        }

        const treasureRequirement = new RecipeItemTreasureRequirement(
          recipeItem.id
        );
        treasureRequirement.item = recipeItem.id;
        treasureRequirement.tier = data[0];
        treasureRequirement.amount = data[1];
        treasureRequirement.save();
      } else if (
        customHandler.equals(ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ADDRESS)
      ) {
        const data = decodeERC1155TokenSetHandlerRequirementData(
          item.customRequirementData
        );
        if (!data) {
          log.error(
            "Error decoding ERC1155 Token Set Corruption Handler requirement data",
            []
          );
          return;
        }

        const erc1155Requirement = new RecipeItemERC1155Requirement(
          recipeItem.id
        );
        erc1155Requirement.item = recipeItem.id;
        erc1155Requirement.amount = data[0].toI32();
        erc1155Requirement.collection = data[1].toAddress();
        erc1155Requirement.tokenIds = data[2].toI32Array().slice(2);
        erc1155Requirement.save();
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
  removal.requestId = params._requestId;
  removal.startTimestamp = event.block.timestamp;
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
