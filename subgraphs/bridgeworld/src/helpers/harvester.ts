import { Address, log } from "@graphprotocol/graph-ts";

import { Harvester, HarvesterStakingRule } from "../../generated/schema";

export const getHarvesterForStakingRule = (
  address: Address
): Harvester | null => {
  const stakingRuleId = address.toHexString();
  const stakingRule = HarvesterStakingRule.load(stakingRuleId);
  if (!stakingRule) {
    log.error("Unknown HarvesterStakingRule:", [stakingRuleId]);
    return null;
  }

  const harvester = Harvester.load(stakingRule.harvester);
  if (!harvester) {
    log.error("Unknown Harvester:", [stakingRule.harvester]);
  }

  return harvester;
};
