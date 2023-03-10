import { BigInt } from "@graphprotocol/graph-ts";

import {
  getHarvester,
  getOrCreateHarvesterConfig,
  removeExpiredExtractors,
} from "./harvester";

export const runHarvestersScheduledJobs = (timestamp: BigInt): void => {
  const config = getOrCreateHarvesterConfig();

  for (let i = 0; i < config.harvesters.length; i++) {
    const harvester = getHarvester(config.harvesters[i]);
    if (!harvester) {
      continue;
    }

    if (
      harvester._nextExpirationTime &&
      timestamp.ge(harvester._nextExpirationTime as BigInt)
    ) {
      removeExpiredExtractors(harvester, timestamp);
    }
  }
};

export const runScheduledJobs = (timestamp: BigInt): void => {
  runHarvestersScheduledJobs(timestamp);
};
