import { LEGION_ADDRESS, TREASURE_ADDRESS } from "@treasure/constants";

import { CraftingFinished } from "../../generated/Mini Crafting/MiniCrafting";
import { LegionInfo, MiniCraft, Outcome } from "../../generated/schema";
import { getAddressId } from "../helpers";

export function handleCraftingFinished(event: CraftingFinished): void {
  const timestamp = event.block.timestamp;
  const params = event.params;
  const tokenId = params._legionId;
  const xpGained = params._cpGained;

  // Save mini craft details
  const miniCraftId = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const miniCraft = new MiniCraft(miniCraftId);
  miniCraft.timestamp = timestamp;
  miniCraft.tier = params._tier;
  miniCraft.token = getAddressId(LEGION_ADDRESS, tokenId);
  miniCraft.user = params._user.toHexString();

  // Save outcome
  const outcome = new Outcome(miniCraftId);
  outcome.rewardAmount = 1;
  outcome.reward = getAddressId(TREASURE_ADDRESS, params._treasureId);
  outcome.success = true;
  outcome.save();

  // Increase craft XP
  if (xpGained > 0) {
    const metadata = LegionInfo.load(`${miniCraft.token}-metadata`);
    if (metadata && metadata.crafting != 6) {
      metadata.craftingXp += xpGained;
      metadata.save();
    }
  }

  miniCraft.outcome = outcome.id;
  miniCraft.save();
}
