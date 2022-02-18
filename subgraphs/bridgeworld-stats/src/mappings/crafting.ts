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

// export function handleCraftingRevealed(event: CraftingRevealed): void {
//   let params = event.params;
//   let result = params._outcome;
//   let tokenId = params._tokenId;
//   let id = getAddressId(event.address, tokenId);

//   let craft = Craft.load(id);

//   if (!craft) {
//     log.error("[craft-revealed] Unknown craft: {}", [id]);

//     return;
//   }

//   let craftId = `${id}-${craft.random}`;
//   let amounts = result.brokenAmounts;
//   let treasures = result.brokenTreasureIds;

//   for (let index = 0; index < amounts.length; index++) {
//     let amount = amounts[index];
//     let treasure = treasures[index];

//     if (amount.isZero() || treasure.isZero()) {
//       continue;
//     }

//     let broken = new Broken(`${craftId}-${treasure.toHexString()}`);

//     broken.outcome = craftId;
//     broken.quantity = amount;
//     broken.token = getAddressId(TREASURE_ADDRESS, treasure);

//     broken.save();
//   }

//   let outcome = new Outcome(craftId);

//   outcome.magicReturned = result.magicReturned;
//   outcome.rewardAmount = result.rewardAmount;
//   outcome.reward = getAddressId(CONSUMABLE_ADDRESS, result.rewardId);
//   outcome.success = result.wasSuccessful;

//   outcome.save();

//   // Increase Xp if successfull
//   if (outcome.success == true) {
//     let metadata = LegionInfo.load(`${craft.token}-metadata`);

//     if (metadata && metadata.crafting != 6) {
//       metadata.craftingXp += getXpPerLevel(metadata.crafting);
//       metadata.save();
//     }
//   }

//   craft.outcome = outcome.id;
//   craft.status = "Revealed";

//   craft.save();
// }

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
