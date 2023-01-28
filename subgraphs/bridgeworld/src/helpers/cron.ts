import { BigInt, log } from "@graphprotocol/graph-ts";

import { Harvester, _HarvesterConfig } from "../../generated/schema";
import { removeExpiredExtractors } from "./harvester";

export const runHarvestersScheduledJobs = (timestamp: BigInt): void => {
  const harvesterConfig = _HarvesterConfig.load("only");
  if (!harvesterConfig) {
    return;
  }

  for (let i = 0; i < harvesterConfig.harvesters.length; i++) {
    const harvester = Harvester.load(harvesterConfig.harvesters[i]);
    if (!harvester) {
      log.warning("Unknown Harvester: {}", [harvesterConfig.harvesters[i]]);
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
