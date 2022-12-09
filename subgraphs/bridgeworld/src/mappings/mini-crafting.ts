import { BigInt, log } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS, TREASURE_ADDRESS } from "@treasure/constants";

import { CraftingFinished } from "../../generated/Mini Crafting/MiniCrafting";
import { LegionInfo, MiniCraft, Outcome } from "../../generated/schema";
import { getAddressId } from "../helpers";

export function handleCraftingFinished(event: CraftingFinished): void {
  const params = event.params;
  const tokenId = params._legionId;
  const xpGained = params._cpGained;

  // Save mini craft details
  const miniCraftId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const miniCraft = new MiniCraft(miniCraftId);
  miniCraft.blockNumber = event.block.number;
  miniCraft.timestamp = event.block.timestamp;
  miniCraft.tier = params._tier;
  miniCraft.token = getAddressId(LEGION_ADDRESS, tokenId);
  miniCraft.user = params._user.toHexString();

  // Save outcome
  const outcome = new Outcome(miniCraftId);
  outcome.magicReturned = BigInt.zero();
  outcome.rewardAmount = 1;
  outcome.reward = getAddressId(TREASURE_ADDRESS, params._treasureId);
  outcome.success = true;
  outcome.save();

  miniCraft.outcome = outcome.id;
  miniCraft.save();

  const metadata = LegionInfo.load(`${miniCraft.token}-metadata`);
  if (!metadata) {
    log.error("Legion metadata not found: {}", [miniCraft.token]);
    return;
  }

  // Increase craft XP
  if (xpGained > 0 && metadata.crafting != 6) {
    metadata.craftingXp += xpGained;
  }

  metadata.miniCraftsCompleted += 1;
  metadata.save();
}
