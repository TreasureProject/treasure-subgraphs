import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Config, LevelConfig } from "../generated/schema";

const CONFIG_ID = Bytes.fromI32(1);

export const getOrCreateConfig = (): Config => {
  let config = Config.load(CONFIG_ID);
  if (!config) {
    config = new Config(CONFIG_ID);
    // Set hard-coded default values
    config.magicCostForAux = BigInt.fromString("150000000000000000000");
    config.maxLevel = 9;
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

export const getOrCreateLevelConfig = (level: i32): LevelConfig => {
  const id = Bytes.fromI32(level);
  let config = LevelConfig.load(id);
  if (!config) {
    config = new LevelConfig(id);
    config.config = CONFIG_ID;
    config.level = level;
    // Set hard-coded default values
    config.xpToNextLevel = BigInt.zero();
    config.save();
  }

  return config;
};
