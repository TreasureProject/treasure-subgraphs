import {
  MalevolentPrismsPerCraftSet,
  MinimumCraftLevelForAuxCorruptionSet,
  RoundResetTimeAllowanceSet,
} from "../generated/CorruptionCryptsRewards/CorruptionCryptsRewards";
import { getOrCreateConfig } from "./helpers";

export function handleMalevolentPrismsPerCraftSet(
  event: MalevolentPrismsPerCraftSet
): void {
  const config = getOrCreateConfig();
  config.cryptsCraftMalevolentPrismsRequired =
    event.params.malevolentPrisms.toI32();
  config.save();
}

export function handleMinimumCraftLevelForAuxCorruptionSet(
  event: MinimumCraftLevelForAuxCorruptionSet
): void {
  const config = getOrCreateConfig();
  config.cryptsCraftMinimumAuxLegionLevel = event.params.craftLevel.toI32();
  config.save();
}

export function handleRoundResetTimeAllowanceSet(
  event: RoundResetTimeAllowanceSet
): void {
  const config = getOrCreateConfig();
  config.cryptsCraftRoundResetTimeAllowance =
    event.params.roundResetTimeAllowance.toI32();
  config.save();
}
