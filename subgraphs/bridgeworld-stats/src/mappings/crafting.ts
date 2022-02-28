import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts";

import { CraftingStarted as CraftingLegacyStarted } from "../../generated/Crafting Legacy/Crafting";
import {
  CraftingFinished,
  CraftingRevealed,
  CraftingStarted,
} from "../../generated/Crafting/Crafting";
import { _Craft } from "../../generated/schema";
import { CRAFT_DIFFICULTIES } from "../helpers/constants";
import { getCraftId } from "../helpers/ids";
import {
  getLegion,
  getOrCreateConsumableStat,
  getOrCreateCraftingDifficultyStat,
  getOrCreateLegionStat,
  getOrCreateTreasureStat,
  getOrCreateUser,
  getTimeIntervalCraftingStats,
} from "../helpers/models";
import { etherToWei } from "../helpers/number";

function handleCraftingStarted(
  block: ethereum.Block,
  userAddress: Address,
  tokenId: BigInt,
  treasureIds: BigInt[],
  treasureAmounts: i32[],
  difficultyIndex: i32
): void {
  const user = getOrCreateUser(userAddress);
  user.craftsStarted += 1;
  user.save();

  const craft = new _Craft(getCraftId(tokenId));
  const difficulty = CRAFT_DIFFICULTIES[difficultyIndex];
  craft.difficulty = difficulty;
  craft.save();

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[crafting] Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.craftsStarted += 1;
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }

    if (!stat._allAddresses.includes(user.id)) {
      stat._allAddresses = stat._allAddresses.concat([user.id]);
      stat.allAddressesCount = stat._allAddresses.length;
    }

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.craftingStat = stat.id;
      legionStat.craftsStarted += 1;
      legionStat.save();
    }

    const difficultyStat = getOrCreateCraftingDifficultyStat(
      stat.id,
      difficulty
    );
    difficultyStat.startTimestamp = stat.startTimestamp;
    difficultyStat.endTimestamp = stat.endTimestamp;
    difficultyStat.craftsStarted += 1;
    difficultyStat.save();

    for (let j = 0; j < treasureIds.length; j++) {
      const treasureId = treasureIds[j];
      if (treasureId.gt(BigInt.zero())) {
        const treasureStat = getOrCreateTreasureStat(stat.id, treasureId);
        treasureStat.startTimestamp = stat.startTimestamp;
        treasureStat.endTimestamp = stat.endTimestamp;
        treasureStat.craftingStat = stat.id;
        treasureStat.craftingUsed += treasureAmounts[j];
        treasureStat.save();
      }
    }

    stat.save();
  }
}

export function handleCraftingStartedWithDifficulty(
  event: CraftingStarted
): void {
  const params = event.params;
  handleCraftingStarted(
    event.block,
    params._owner,
    params._tokenId,
    params._treasureIds,
    params._treasureAmounts,
    params._difficulty
  );
}

export function handleCraftingStartedWithoutDifficulty(
  event: CraftingLegacyStarted
): void {
  const params = event.params;
  handleCraftingStarted(
    event.block,
    params._owner,
    params._tokenId,
    params._treasureIds,
    params._treasureAmounts,
    0 // Prism
  );
}

export function handleCraftingRevealed(event: CraftingRevealed): void {
  const params = event.params;
  const tokenId = params._tokenId;
  const result = params._outcome;
  const brokenTreasureIds = result.brokenTreasureIds;
  const brokenAmounts = result.brokenAmounts;
  const succeededCount = result.wasSuccessful ? 1 : 0;
  const failedCount = result.wasSuccessful ? 0 : 1;

  let brokenTreasuresCount = 0;
  for (let i = 0; i < brokenAmounts.length; i++) {
    brokenTreasuresCount += brokenAmounts[i].toI32();
  }

  const user = getOrCreateUser(params._owner);
  user.craftsSucceeded += succeededCount;
  user.craftsFailed += failedCount;
  user.brokenTreasuresCount += brokenTreasuresCount;
  user.save();

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[crafting] Legion not found: {}", [tokenId.toString()]);
  }

  const craft = _Craft.load(getCraftId(tokenId));
  if (!craft) {
    log.error("[crafting] Craft not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicConsumed = stat.magicConsumed.plus(
      etherToWei(5).minus(result.magicReturned)
    );
    stat.magicReturned = stat.magicReturned.plus(result.magicReturned);
    stat.craftsSucceeded += succeededCount;
    stat.craftsFailed += failedCount;
    stat.brokenTreasuresCount += brokenTreasuresCount;
    stat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.craftsSucceeded += succeededCount;
      legionStat.craftsFailed += failedCount;
      legionStat.save();
    }

    if (craft) {
      const difficultyStat = getOrCreateCraftingDifficultyStat(
        stat.id,
        craft.difficulty
      );
      difficultyStat.magicConsumed = difficultyStat.magicConsumed.plus(
        etherToWei(5).minus(result.magicReturned)
      );
      difficultyStat.magicReturned = difficultyStat.magicReturned.plus(
        result.magicReturned
      );
      difficultyStat.craftsSucceeded += succeededCount;
      difficultyStat.craftsFailed += failedCount;
      difficultyStat.brokenTreasuresCount += brokenTreasuresCount;
      difficultyStat.save();
    }

    if (result.rewardId) {
      const consumableStat = getOrCreateConsumableStat(
        stat.id,
        result.rewardId
      );
      consumableStat.startTimestamp = stat.startTimestamp;
      consumableStat.endTimestamp = stat.endTimestamp;
      consumableStat.craftingStat = stat.id;
      consumableStat.craftingEarned += result.rewardAmount;
      consumableStat.save();
    }

    for (let j = 0; j < brokenTreasureIds.length; j++) {
      const treasureId = brokenTreasureIds[j];
      if (treasureId.gt(BigInt.zero())) {
        const treasureStat = getOrCreateTreasureStat(stat.id, treasureId);
        treasureStat.startTimestamp = stat.startTimestamp;
        treasureStat.endTimestamp = stat.endTimestamp;
        treasureStat.craftingStat = stat.id;
        treasureStat.craftingBroken += brokenAmounts[j].toI32();
        treasureStat.save();
      }
    }
  }
}

export function handleCraftingFinished(event: CraftingFinished): void {
  const params = event.params;
  const tokenId = params._tokenId;

  const user = getOrCreateUser(params._owner);
  user.craftsFinished += 1;
  user.save();
  const isUserCrafting = user.craftsStarted > user.craftsFinished;

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[crafting] Legion not found: {}", [tokenId.toString()]);
  }

  const craft = _Craft.load(getCraftId(tokenId));
  if (!craft) {
    log.error("[crafting] Craft not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.craftsFinished += 1;
    if (!isUserCrafting) {
      const addressIndex = stat._activeAddresses.indexOf(user.id);
      if (addressIndex >= 0) {
        const addresses = stat._activeAddresses;
        addresses.splice(addressIndex, 1);
        stat._activeAddresses = addresses;
        stat.activeAddressesCount = addresses.length;
      }
    }
    stat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.craftsFinished += 1;
      legionStat.save();
    }

    if (craft) {
      const difficultyStat = getOrCreateCraftingDifficultyStat(
        stat.id,
        craft.difficulty
      );
      difficultyStat.craftsFinished += 1;
      difficultyStat.save();
    }
  }

  if (craft) {
    store.remove("_Craft", craft.id);
  }
}
