import { BigInt } from "@graphprotocol/graph-ts";

import { RecruitConfig, RecruitLevelConfig } from "../../generated/schema";

export const getOrCreateRecruitConfig = (): RecruitConfig => {
  let config = RecruitConfig.load("only");
  if (!config) {
    config = new RecruitConfig("only");
    // Set hard-coded default values
    config.maxLevel = 8;
    config.cadetAscensionMinLevel = 3;
    config.cadetAscensionCostEssenceOfStarlight = 6;
    config.cadetAscensionCostPrismShards = 6;
    config.apprenticeAscensionMinLevel = 7;
    config.apprenticeAscensionCostEssenceOfStarlight = 12;
    config.apprenticeAscensionCostPrismShards = 12;
    config.save();
  }

  return config;
};

export const getOrCreateRecruitLevelConfig = (
  level: i32
): RecruitLevelConfig => {
  const id = `recruit-level-config-${level.toString()}`;
  let config = RecruitLevelConfig.load(id);
  if (!config) {
    config = new RecruitLevelConfig(id);
    config.recruitConfig = "only";
    config.level = level;
    // Set hard-coded default values
    config.xpToNextLevel = BigInt.zero();
    config.save();
  }

  return config;
};
