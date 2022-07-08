import { Address, log } from "@graphprotocol/graph-ts";

import {
  Harvester,
  HarvesterNftHandler,
  HarvesterStakingRule,
} from "../../generated/schema";

const getHarvesterById = (id: string): Harvester | null => {
  const harvester = Harvester.load(id);
  if (!harvester) {
    log.error("Unknown Harvester:", [id]);
  }

  return harvester;
};

export const getHarvester = (address: Address): Harvester | null =>
  getHarvesterById(address.toHexString());

export const getHarvesterForNftHandler = (
  address: Address
): Harvester | null => {
  const nftHandlerId = address.toHexString();
  const nftHandler = HarvesterNftHandler.load(nftHandlerId);
  if (!nftHandler) {
    log.error("Unknown HarvesterNftHandler:", [nftHandlerId]);
    return null;
  }

  return getHarvesterById(nftHandler.harvester);
};

export const getHarvesterForStakingRule = (
  address: Address
): Harvester | null => {
  const stakingRuleId = address.toHexString();
  const stakingRule = HarvesterStakingRule.load(stakingRuleId);
  if (!stakingRule) {
    log.error("Unknown HarvesterStakingRule:", [stakingRuleId]);
    return null;
  }

  return getHarvesterById(stakingRule.harvester);
};
