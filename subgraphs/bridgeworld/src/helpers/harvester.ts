import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { CONSUMABLE_ADDRESS } from "@treasure/constants";

import {
  Harvester,
  HarvesterNftHandler,
  HarvesterStakingRule,
  HarvesterTokenBoost,
  StakedToken,
  Token,
} from "../../generated/schema";
import { TWO_BI } from "./constants";
import { etherToWei } from "./number";

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

export const calculateHarvesterLegionsBoost = (
  harvester: Harvester
): BigInt => {
  if (harvester.legionsStaked == 0) {
    return BigInt.zero();
  }

  // (2n - n^2/maxLegions)/maxLegions) * (0.9 + avgLegionRank / 10)
  const stakedAmount = etherToWei(harvester.legionsStaked);
  const maxStakedAmount = etherToWei(harvester.maxLegionsStaked);
  const legionsRankBoost = etherToWei(0.9).plus(
    harvester.legionsTotalRank
      .div(BigInt.fromI32(harvester.legionsStaked))
      .div(etherToWei(10))
  );
  return stakedAmount
    .times(TWO_BI)
    .minus(stakedAmount.pow(2).div(maxStakedAmount))
    .times(legionsRankBoost)
    .div(maxStakedAmount);
};

export const createOrUpdateHarvesterTokenBoost = (
  harvester: Harvester,
  token: Token,
  boost: BigInt
): HarvesterTokenBoost => {
  const tokenBoostId = `${harvester.id}-${token.id}`;
  let tokenBoost = HarvesterTokenBoost.load(tokenBoostId);
  if (!tokenBoost) {
    tokenBoost = new HarvesterTokenBoost(tokenBoostId);
    tokenBoost.harvester = harvester.id;
    tokenBoost.token = token.id;
  }

  tokenBoost.boost = boost;
  tokenBoost.save();

  return tokenBoost;
};

export const createStakedExtractorId = (
  harvester: Harvester,
  spotId: i32
): string =>
  `${harvester.id}-${CONSUMABLE_ADDRESS.toHexString()}-${spotId.toString()}`;

export const removeExpiredExtractors = (
  harvester: Harvester,
  timestamp: BigInt
): void => {
  let nextExpirationTime: BigInt | null = null;
  for (let i = 0; i < harvester.maxExtractorsStaked; i++) {
    const stakedToken = StakedToken.load(createStakedExtractorId(harvester, i));
    if (!stakedToken) {
      log.info("No Extractor found in spot: {}", [i.toString()]);
      continue;
    }

    if (stakedToken.expirationTime && !stakedToken.expirationProcessed) {
      if (timestamp.ge(stakedToken.expirationTime as BigInt)) {
        const tokenBoost = HarvesterTokenBoost.load(
          `${harvester.id}-${stakedToken.token}`
        );
        if (!tokenBoost) {
          log.error("Extractor boost info not found: {}, {}", [
            harvester.id,
            stakedToken.token.toString(),
          ]);
          continue;
        }

        log.info(
          "Removing boost value for expired Extractor from Harvester {} in spot {}",
          [harvester.id, stakedToken.index.toString()]
        );

        harvester.extractorsBoost = harvester.extractorsBoost.minus(
          tokenBoost.boost
        );
        stakedToken.expirationProcessed = true;
        stakedToken.save();
      } else if (
        !nextExpirationTime ||
        (stakedToken.expirationTime as BigInt).lt(nextExpirationTime)
      ) {
        nextExpirationTime = stakedToken.expirationTime;
      }
    }
  }

  harvester._nextExpirationTime = nextExpirationTime;
  harvester.save();
};
