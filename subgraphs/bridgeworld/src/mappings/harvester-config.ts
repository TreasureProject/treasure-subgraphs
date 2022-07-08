import { log } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import {
  HarvesterNftHandler,
  HarvesterStakingRule,
} from "../../generated/schema";
import {
  LegionsStakingRules,
  PartsStakingRules,
  TreasuresStakingRules,
} from "../../generated/templates";
import {
  Lifetime,
  MaxStakeable,
} from "../../generated/templates/ExtractorsStakingRules/ExtractorsStakingRules";
import { TotalDepositCap } from "../../generated/templates/HarvesterConfig/Harvester";
import { MaxWeight } from "../../generated/templates/LegionsStakingRules/LegionsStakingRules";
import { NftConfigSet } from "../../generated/templates/NftHandler/NftHandler";
import {
  BoostFactor,
  MaxStakeablePerUser,
  MaxStakeableTotal,
} from "../../generated/templates/PartsStakingRules/PartsStakingRules";
import { getHarvester, getHarvesterForStakingRule } from "../helpers/harvester";

export function handleUpdatedMagicTotalDepositCap(
  event: TotalDepositCap
): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxMagicDeposited = event.params.totalDepositCap;
}

export function handleNftConfigSet(event: NftConfigSet): void {
  // Load associated NftHandler
  const nftHandler = HarvesterNftHandler.load(event.address.toHexString());
  if (!nftHandler) {
    log.error("NFT config set on unknown NFT handler: {}", [
      event.address.toHexString(),
    ]);
    return;
  }

  const params = event.params;

  // Create StakingRule entity
  const stakingRulesAddress = params._nftConfig.stakingRules;
  const stakingRule = new HarvesterStakingRule(
    stakingRulesAddress.toHexString()
  );
  stakingRule.harvester = nftHandler.harvester;
  stakingRule.save();

  // Determine the type of StakingRule and start listening for events at this address
  if (params._nft.equals(CONSUMABLE_ADDRESS)) {
    // TODO: Swap to consumables staking rules when ABI is available
    PartsStakingRules.create(stakingRulesAddress);
  } else if (params._nft.equals(LEGION_ADDRESS)) {
    LegionsStakingRules.create(stakingRulesAddress);
  } else if (params._nft.equals(TREASURE_ADDRESS)) {
    TreasuresStakingRules.create(stakingRulesAddress);
  }
}

export function handleUpdatedPartsBoostFactor(event: BoostFactor): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.partsBoostFactor = event.params.boostFactor;
}

export function handleUpdatedPartsMaxStakeablePerUser(
  event: MaxStakeablePerUser
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxPartsStakedPerUser = event.params.maxStakeablePerUser.toI32();
}

export function handleUpdatedPartsStakeableTotal(
  event: MaxStakeableTotal
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxPartsStaked = event.params.maxStakeableTotal.toI32();
}

export function handleUpdatedExtractorsLifetime(event: Lifetime): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.extractorsLifetime = event.params.lifetime;
}

export function handleUpdatedExtractorsMaxStakeable(event: MaxStakeable): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxExtractorsStaked = event.params.maxStakeable.toI32();
}

export function handleUpdatedLegionsMaxStakeableTotal(
  event: MaxStakeableTotal
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsStaked = event.params.maxStakeableTotal.toI32();
}

export function handleUpdatedLegionsMaxWeight(event: MaxWeight): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsWeightPerUser = event.params.maxLegionWeight.toI32();
}

export function handleUpdatedTreasuresMaxStakeablePerUser(
  event: MaxStakeablePerUser
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxTreasuresStakedPerUser =
    event.params.maxStakeablePerUser.toI32();
}
