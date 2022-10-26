import { Bytes, log } from "@graphprotocol/graph-ts";
import {
  AscensionInfoSet,
  LevelUpInfoSet,
  MagicCostForAuxSet,
  MaxLevelSet,
  RecruitAscendingToAuxBegan,
  RecruitAscendingToAuxEnded,
} from "../generated/Recruit Level/RecruitLevel";
import { Ascension, AscensionRequest } from "../generated/schema";
import { getOrCreateConfig, getOrCreateLevelConfig } from "./helpers";

export function handleAscensionInfoSet(event: AscensionInfoSet): void {
  const params = event.params;
  const config = getOrCreateConfig();
  config.cadetAscensionMinLevel = params.minimumLevelCadet;
  config.cadetAscensionCostEssenceOfStarlight = params.numEoSCadet;
  config.cadetAscensionCostPrismShards = params.numPrismShardsCadet;
  config.apprenticeAscensionMinLevel = params.minimumLevelApprentice;
  config.apprenticeAscensionCostEssenceOfStarlight = params.numEoSApprentice;
  config.apprenticeAscensionCostPrismShards = params.numPrismShardsApprentice;
  config.save();
}

export function handleLevelUpInfoSet(event: LevelUpInfoSet): void {
  const params = event.params;
  const config = getOrCreateLevelConfig(params.levelCur);
  config.xpToNextLevel = params.expToNextLevel;
  config.save();
}

export function handleMagicCostForAuxSet(event: MagicCostForAuxSet): void {
  const config = getOrCreateConfig();
  config.magicCostForAux = event.params.magicCost;
  config.save();
}

export function handleMaxLevelSet(event: MaxLevelSet): void {
  const config = getOrCreateConfig();
  config.maxLevel = event.params.maxLevel;
  config.save();
}

export function handleRecruitAscendingToAuxBegan(
  event: RecruitAscendingToAuxBegan
): void {
  const params = event.params;

  const ascension = new Ascension(Bytes.fromI32(params.tokenId.toI32()));
  ascension.tokenId = params.tokenId;
  ascension.status = "Started";
  ascension.save();

  const ascensionRequest = new AscensionRequest(
    Bytes.fromI32(params.requestId.toI32())
  );
  ascensionRequest.ascension = ascension.id;
  ascensionRequest.save();
}

export function handleRecruitAscendingToAuxEnded(
  event: RecruitAscendingToAuxEnded
): void {
  const params = event.params;

  const ascension = Ascension.load(Bytes.fromI32(params.tokenId.toI32()));
  if (!ascension) {
    log.error("[recruit-level] Ending unknown ascension: {}", [
      params.tokenId.toString(),
    ]);
    return;
  }

  ascension.status = params.wasSuccessful ? "Finished" : "Failed";
  ascension.save();
}
