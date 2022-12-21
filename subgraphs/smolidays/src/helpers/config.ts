import { Config } from "../../generated/schema";

export const getOrCreateConfig = (): Config => {
  let config = Config.load("only");
  if (!config) {
    config = new Config("only");
    config.currentDay = 0;
    config.paused = true;
    config.save();
  }

  return config;
};
