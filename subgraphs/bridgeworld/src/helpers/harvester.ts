import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";

import { CONSUMABLE_ADDRESS } from "@treasure/constants";

import {
  Harvester,
  HarvesterConfig,
  HarvesterNftHandler,
  HarvesterStakingRule,
} from "../../generated/schema";
import { TWO_BI } from "./constants";
import { etherToWei } from "./number";

const SINGLETON_ID = Bytes.fromI32(1);

export const getOrCreateHarvesterConfig = (): HarvesterConfig => {
  let config = HarvesterConfig.load(SINGLETON_ID);
  if (!config) {
    config = new HarvesterConfig(SINGLETON_ID);
    config.harvesters = [];
  }

  return config;
};

export const getHarvester = (address: Bytes): Harvester | null => {
  const harvester = Harvester.load(address);
  if (!harvester) {
    log.error("Unknown Harvester: {}", [address.toHexString()]);
  }

  return harvester;
};

export const getHarvesterForNftHandler = (
  address: Address
): Harvester | null => {
  const nftHandler = HarvesterNftHandler.load(address);
  if (!nftHandler) {
    log.error("Unknown HarvesterNftHandler: {}", [address.toHexString()]);
    return null;
  }

  return getHarvester(nftHandler.harvester);
};

export const getHarvesterForStakingRule = (
  address: Address
): Harvester | null => {
  const stakingRule = HarvesterStakingRule.load(address);
  if (!stakingRule) {
    log.error("Unknown HarvesterStakingRule: {}", [address.toHexString()]);
    return null;
  }

  return getHarvester(stakingRule.harvester);
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
