import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import * as craftingLegacy from "../../generated/Crafting Legacy/Crafting";
import {
  CraftingFinished,
  CraftingRevealed,
  CraftingStarted,
} from "../../generated/Crafting/Crafting";
import {
  Broken,
  Craft,
  LegionInfo,
  Outcome,
  Random,
} from "../../generated/schema";
import { DIFFICULTY, getAddressId, getXpPerLevel } from "../helpers";

function handleCraftingStarted(
  address: Address,
  user: Address,
  tokenId: BigInt,
  requestId: BigInt,
  finishTime: BigInt,
  difficulty: i32
): void {
  let random = Random.load(requestId.toHexString());
  let craft = new Craft(getAddressId(address, tokenId));

  if (!random) {
    log.error("[craft-started] Unknown random: {}", [requestId.toString()]);

    return;
  }

  // TODO: Add treasures sent in for craft
  craft.difficulty = DIFFICULTY[difficulty];
  craft.endTimestamp = finishTime.times(BigInt.fromI32(1000));
  craft.token = getAddressId(LEGION_ADDRESS, tokenId);
  craft.random = random.id;
  craft.status = "Idle";
  craft.user = user.toHexString();

  random.craft = craft.id;
  random.requestId = requestId;

  craft.save();
  random.save();
}

export function handleCraftingStartedWithDifficulty(
  event: CraftingStarted
): void {
  let params = event.params;

  handleCraftingStarted(
    event.address,
    params._owner,
    params._tokenId,
    params._requestId,
    params._finishTime,
    params._difficulty
  );
}

export function handleCraftingStartedWithoutDifficulty(
  event: craftingLegacy.CraftingStarted
): void {
  let params = event.params;

  handleCraftingStarted(
    event.address,
    params._owner,
    params._tokenId,
    params._requestId,
    params._finishTime,
    0 // Easy difficulty
  );
}

export function handleCraftingRevealed(event: CraftingRevealed): void {
  let params = event.params;
  let result = params._outcome;
  let tokenId = params._tokenId;
  let id = getAddressId(event.address, tokenId);

  let craft = Craft.load(id);

  if (!craft) {
    log.error("[craft-revealed] Unknown craft: {}", [id]);

    return;
  }

  let craftId = `${id}-${craft.random}`;
  let amounts = result.brokenAmounts;
  let treasures = result.brokenTreasureIds;

  for (let index = 0; index < amounts.length; index++) {
    let amount = amounts[index];
    let treasure = treasures[index];

    if (amount.isZero() || treasure.isZero()) {
      continue;
    }

    let broken = new Broken(`${craftId}-${treasure.toHexString()}`);

    broken.outcome = craftId;
    broken.quantity = amount;
    broken.token = getAddressId(TREASURE_ADDRESS, treasure);

    broken.save();
  }

  let outcome = new Outcome(craftId);

  outcome.magicReturned = result.magicReturned;
  outcome.rewardAmount = result.rewardAmount;
  outcome.reward = getAddressId(CONSUMABLE_ADDRESS, result.rewardId);
  outcome.success = result.wasSuccessful;

  outcome.save();

  // Increase Xp if successfull
  if (outcome.success == true) {
    let metadata = LegionInfo.load(`${craft.token}-metadata`);

    if (metadata && metadata.crafting != 6) {
      metadata.craftingXp += getXpPerLevel(metadata.crafting);
      metadata.save();
    }
  }

  craft.outcome = outcome.id;
  craft.status = "Revealed";

  craft.save();
}

export function handleCraftingFinished(event: CraftingFinished): void {
  let id = getAddressId(event.address, event.params._tokenId);

  let craft = Craft.load(id);

  if (!craft) {
    log.error("[craft-finished] Unknown craft: {}", [id]);

    return;
  }

  craft.id = `${craft.id}-${craft.random}`;
  craft.status = "Finished";
  craft.save();

  // Remove old craft
  store.remove("Craft", id);
}
