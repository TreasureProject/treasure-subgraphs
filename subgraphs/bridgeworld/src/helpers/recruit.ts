import { BigInt } from "@graphprotocol/graph-ts";

import { RecruitConfig, RecruitLevelConfig } from "../../generated/schema";

export const getOrCreateRecruitConfig = (): RecruitConfig => {
  let config = RecruitConfig.load("only");
  if (!config) {
    config = new RecruitConfig("only");
    // Set hard-coded default values
    config.maxLevel = 7;
    config.ascensionMinLevel = 3;
    config.ascensionCostEssenceOfStarlight = 6;
    config.ascensionCostPrismShards = 6;
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
