import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { etherToWei } from "../../../bridgeworld-stats/src/helpers/number";
import {
  Harvester,
  HarvesterNftHandler,
  HarvesterStakingRule,
  HarvesterTokenBoost,
  Token,
} from "../../generated/schema";
import { TWO_BI } from "./constants";

const getHarvesterById = (id: string): Harvester | null => {
  const harvester = Harvester.load(id);
  if (!harvester) {
    log.error("Unknown Harvester: {}", [id]);
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
    log.error("Unknown HarvesterNftHandler: {}", [nftHandlerId]);
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
    log.error("Unknown HarvesterStakingRule: {}", [stakingRuleId]);
    return null;
  }

  return getHarvesterById(stakingRule.harvester);
};

export const calculateHarvesterPartsBoost = (harvester: Harvester): BigInt => {
  // (2n - n^2/maxParts)/maxParts) * partsBoostFactor
  const stakedAmount = etherToWei(harvester.partsStaked);
  const maxStakedAmount = etherToWei(harvester.maxPartsStaked);
  return stakedAmount
    .times(TWO_BI)
    .minus(stakedAmount.pow(2).div(maxStakedAmount))
    .times(harvester.partsBoostFactor)
    .div(maxStakedAmount);
};

export const getOrCreateHarvesterTokenBoost = (
  harvester: Harvester,
  token: Token
): HarvesterTokenBoost => {
  const tokenBoostId = `${harvester.id}-${token.id}`;
  let tokenBoost = HarvesterTokenBoost.load(tokenBoostId);
  if (!tokenBoost) {
    tokenBoost = new HarvesterTokenBoost(tokenBoostId);
    tokenBoost.token = token.id;
    tokenBoost.save();
  }

  return tokenBoost;
};
