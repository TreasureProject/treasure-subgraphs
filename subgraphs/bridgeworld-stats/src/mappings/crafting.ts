import * as craftingLegacy from "../../generated/Crafting Legacy/Crafting";
import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import {
  CraftingFinished,
  CraftingRevealed,
  CraftingStarted,
} from "../../generated/Crafting/Crafting";
import { getOrCreateUser, getTimeIntervalCraftingStats } from "../helpers/models";
import { ZERO_BI } from "../helpers/constants";
import { etherToWei } from "../helpers/number";

function handleCraftingStarted(
  timestamp: BigInt,
  userAddress: Address,
  tokenId: BigInt
): void {
  const user = getOrCreateUser(userAddress);
  user.craftsStarted += 1;
  user.save();

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
  );
}

export function handleCraftingStartedWithoutDifficulty(
  event: craftingLegacy.CraftingStarted
): void {
  const params = event.params;
  handleCraftingStarted(
    event.block.timestamp,
    params._owner,
    params._tokenId
  );
}

export function handleCraftingRevealed(event: CraftingRevealed): void {
  const params = event.params;

  const result = params._outcome;
  const wasSuccessful = result.wasSuccessful;
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

  const stats = getTimeIntervalCraftingStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicConsumed = etherToWei(5).minus(result.magicReturned);
    stat.magicReturned = stat.magicReturned.plus(result.magicReturned);
    stat.craftsSucceeded += wasSuccessful ? 1 : 0;
    stat.craftsFailed += wasSuccessful ? 0 : 1;
    stat.brokenTreasuresCount += brokenTreasuresCount;
    stat.save();
  }
}

export function handleCraftingFinished(event: CraftingFinished): void {
  const params = event.params;

  const user = getOrCreateUser(params._owner);
  user.craftsFinished += 1;
  user.save();
  const isUserCrafting = user.craftsStarted > user.craftsFinished;

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
  }
}
