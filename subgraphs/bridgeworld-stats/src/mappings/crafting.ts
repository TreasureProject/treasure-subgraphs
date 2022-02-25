import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  CraftingFinished,
  CraftingRevealed,
  CraftingStarted,
} from "../../generated/Crafting/Crafting";
import {
  CraftingStarted as CraftingLegacyStarted
} from "../../generated/Crafting Legacy/Crafting";
import {
  getLegion,
  getOrCreateCraftingDifficultyStat,
  getOrCreateLegionStat,
  getOrCreateTreasureStat,
  getOrCreateUser,
  getTimeIntervalCraftingStats
} from "../helpers/models";
import { etherToWei } from "../helpers/number";
import { _Craft } from "../../generated/schema";
import { getCraftId } from "../helpers/ids";
import { CRAFT_DIFFICULTIES } from "../helpers/constants";

function handleCraftingStarted(
  timestamp: BigInt,
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
    log.error("Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(timestamp);
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

    const difficultyStat = getOrCreateCraftingDifficultyStat(stat.id, difficulty);
    difficultyStat.startTimestamp = stat.startTimestamp;
    difficultyStat.endTimestamp = stat.endTimestamp;
    difficultyStat.craftsStarted += 1;
    difficultyStat.save();

    for (let j = 0; j < treasureIds.length; j++) {
      const treasureStat = getOrCreateTreasureStat(stat.id, treasureIds[j]);
      treasureStat.startTimestamp = stat.startTimestamp;
      treasureStat.endTimestamp = stat.endTimestamp;
      treasureStat.craftingStat = stat.id;
      treasureStat.craftingUsed += treasureAmounts[j];
      treasureStat.save();
    }

    stat.save();
  }
}

export function handleCraftingStartedWithDifficulty(
  event: CraftingStarted
): void {
  const params = event.params;
  handleCraftingStarted(
    event.block.timestamp,
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
    event.block.timestamp,
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
  const wasSuccessful = result.wasSuccessful;
  const brokenTreasureIds = result.brokenTreasureIds;
  const brokenAmounts = result.brokenAmounts;

  let brokenTreasuresCount = 0;
  for (let i = 0; i < brokenAmounts.length; i++) {
    brokenTreasuresCount += brokenAmounts[i].toI32();
  }

  const user = getOrCreateUser(params._owner);
  user.craftsSucceeded += wasSuccessful ? 1 : 0;
  user.craftsFailed += wasSuccessful ? 0 : 1;
  user.brokenTreasuresCount += brokenTreasuresCount;
  user.save();

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("Legion not found: {}", [tokenId.toString()]);
  }

  const craft = _Craft.load(getCraftId(tokenId));
  if (!craft) {
    log.error("Craft not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicConsumed = stat.magicConsumed.plus(etherToWei(5).minus(result.magicReturned));
    stat.magicReturned = stat.magicReturned.plus(result.magicReturned);
    stat.craftsSucceeded += wasSuccessful ? 1 : 0;
    stat.craftsFailed += wasSuccessful ? 0 : 1;
    stat.brokenTreasuresCount += brokenTreasuresCount;
    stat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.craftsSucceeded += wasSuccessful ? 1 : 0;
      legionStat.craftsFailed += wasSuccessful ? 0 : 1;
      legionStat.save();
    }

    if (craft) {
      const difficultyStat = getOrCreateCraftingDifficultyStat(stat.id, craft.difficulty);
      difficultyStat.startTimestamp = stat.startTimestamp;
      difficultyStat.endTimestamp = stat.endTimestamp;
      difficultyStat.magicConsumed = difficultyStat.magicConsumed.plus(etherToWei(5).minus(result.magicReturned));
      difficultyStat.magicReturned = difficultyStat.magicReturned.plus(result.magicReturned);
      difficultyStat.craftsSucceeded += wasSuccessful ? 1 : 0;
      difficultyStat.craftsFailed += wasSuccessful ? 0 : 1;
      difficultyStat.brokenTreasuresCount += brokenTreasuresCount;
      difficultyStat.save();
    }

    for (let j = 0; j < brokenTreasureIds.length; j++) {
      const treasureStat = getOrCreateTreasureStat(stat.id, brokenTreasureIds[j]);
      treasureStat.startTimestamp = stat.startTimestamp;
      treasureStat.endTimestamp = stat.endTimestamp;
      treasureStat.craftingStat = stat.id;
      treasureStat.craftingBroken += brokenAmounts[j].toI32();
      treasureStat.save();
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
    log.error("Legion not found: {}", [tokenId.toString()]);
  }

  const craft = _Craft.load(getCraftId(tokenId));
  if (!craft) {
    log.error("Craft not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalCraftingStats(event.block.timestamp);
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
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.craftsFinished += 1;
      legionStat.save();
    }

    if (craft) {
      const difficultyStat = getOrCreateCraftingDifficultyStat(stat.id, craft.difficulty);
      difficultyStat.startTimestamp = stat.startTimestamp;
      difficultyStat.endTimestamp = stat.endTimestamp;
      difficultyStat.craftsFinished += 1;
      difficultyStat.save();
    }
  }

  if (craft) {
    store.remove("_Craft", craft.id);
  }
}
