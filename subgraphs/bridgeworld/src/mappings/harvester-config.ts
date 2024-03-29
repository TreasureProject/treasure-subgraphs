import { Address, log } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import {
  Harvester,
  HarvesterStakingRule,
  HarvesterTimelock,
} from "../../generated/schema";
import {
  ERC721StakingRules,
  ExtractorsStakingRules,
  ExtractorsStakingRulesConfig,
  LegionsStakingRules,
  PartsStakingRules,
  TreasuresStakingRules,
} from "../../generated/templates";
import {
  MaxStakeableTotal as ERC721MaxStakeableTotal,
  MaxWeight as ERC721MaxWeight,
  ERC721StakingRules as ERC721StakingRulesContract,
} from "../../generated/templates/ERC721StakingRules/ERC721StakingRules";
import {
  ExtractorsStakingRules as ExtractorsStakingRulesContract,
  MaxStakeable,
} from "../../generated/templates/ExtractorsStakingRulesConfig/ExtractorsStakingRules";
import {
  DepositCapPerWallet,
  TimelockOption,
  TimelockOptionDisabled,
  TimelockOptionEnabled,
  TotalDepositCap,
} from "../../generated/templates/HarvesterConfig/Harvester";
import {
  LegionsStakingRules as LegionsStakingRulesContract,
  MaxWeight,
} from "../../generated/templates/LegionsStakingRules/LegionsStakingRules";
import { NftConfigSet } from "../../generated/templates/NftHandler/NftHandler";
import {
  BoostFactor,
  MaxStakeablePerUser,
  MaxStakeableTotal,
  PartsStakingRules as PartsStakingRulesContract,
} from "../../generated/templates/PartsStakingRules/PartsStakingRules";
import { TreasuresStakingRules as TreasuresStakingRulesContract } from "../../generated/templates/TreasuresStakingRules/TreasuresStakingRules";
import { HARVESTER_EXTRACTOR_TOKEN_IDS } from "../helpers";
import {
  getHarvester,
  getHarvesterForNftHandler,
  getHarvesterForStakingRule,
} from "../helpers/harvester";

export function handleUpdatedMagicTotalDepositCap(
  event: TotalDepositCap
): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxMagicDeposited = event.params.totalDepositCap;
  harvester.save();
}

export function handleUpdatedPartsDepositCap(event: DepositCapPerWallet): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params.depositCapPerWallet;
  harvester.partsAddress = params.parts;
  harvester.partsTokenId = params.partsTokenId;
  harvester.magicDepositAllocationPerPart = params.capPerPart;
  harvester.save();
}

export function handleAddedTimelockOption(event: TimelockOption): void {
  const params = event.params;
  const timelock = new HarvesterTimelock(
    event.address.concatI32(params.id.toI32())
  );
  timelock.harvester = event.address;
  timelock.enabled = params.timelock.enabled;
  timelock.timelockId = params.id;
  timelock.boost = params.timelock.boost;
  timelock.duration = params.timelock.timelock;
  timelock.vestingDuration = params.timelock.vesting;
  timelock.save();
}

export function handleEnabledTimelockOption(
  event: TimelockOptionEnabled
): void {
  const params = event.params;
  const timelock = HarvesterTimelock.load(
    event.address.concatI32(params.id.toI32())
  );
  if (!timelock) {
    log.error("Unknown timelock option: {}", [params.id.toString()]);
    return;
  }

  timelock.enabled = true;
  timelock.save();
}

export function handleDisabledTimelockOption(
  event: TimelockOptionDisabled
): void {
  const params = event.params;
  const timelock = HarvesterTimelock.load(
    event.address.concatI32(params.id.toI32())
  );
  if (!timelock) {
    log.error("Unknown timelock option: {}", [params.id.toString()]);
    return;
  }

  timelock.enabled = false;
  timelock.save();
}

export function handleNftConfigSet(event: NftConfigSet): void {
  // Load associated Harvester
  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const nftAddress = params._nft;

  // Create StakingRule entity
  const stakingRulesAddress = params._nftConfig.stakingRules;
  const tokenId = params._tokenId;
  // Determine the type of StakingRule and start listening for events at this address
  // Pull initial rules from the contract because we weren't listening for init events
  const stakingRule = new HarvesterStakingRule(stakingRulesAddress);
  stakingRule.harvester = harvester.id;
  stakingRule.nft = nftAddress;
  stakingRule.type = "Unknown";

  if (
    nftAddress.equals(harvester.partsAddress) &&
    tokenId.equals(harvester.partsTokenId)
  ) {
    stakingRule.type = "Parts";
    PartsStakingRules.create(stakingRulesAddress);
    processPartsStakingRules(stakingRulesAddress, harvester);
  } else if (
    nftAddress.equals(CONSUMABLE_ADDRESS) &&
    HARVESTER_EXTRACTOR_TOKEN_IDS.includes(tokenId)
  ) {
    stakingRule.type = "Extractors";
    ExtractorsStakingRulesConfig.create(stakingRulesAddress);
    ExtractorsStakingRules.create(stakingRulesAddress);
    processExtractorsStakingRules(stakingRulesAddress, harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
    stakingRule.type = "Legions";
    LegionsStakingRules.create(stakingRulesAddress);
    processLegionsStakingRules(stakingRulesAddress, harvester);
  } else if (nftAddress.equals(TREASURE_ADDRESS)) {
    stakingRule.type = "Treasures";
    TreasuresStakingRules.create(stakingRulesAddress);
    processTreasuresStakingRules(stakingRulesAddress, harvester);
  } else if (params._nftConfig.supportedInterface == 1) {
    // ERC721
    stakingRule.type = "ERC721";
    ERC721StakingRules.create(stakingRulesAddress);
    processERC721StakingRules(stakingRulesAddress, harvester);
  }

  stakingRule.save();
}

const processPartsStakingRules = (
  address: Address,
  harvester: Harvester
): void => {
  const contract = PartsStakingRulesContract.bind(address);

  let result = contract.try_boostFactor();
  if (!result.reverted) {
    harvester.partsBoostFactor = result.value;
  } else {
    log.error("Error fetching Parts boost factor: {}", [address.toHexString()]);
  }

  result = contract.try_maxStakeablePerUser();
  if (!result.reverted) {
    harvester.maxPartsStakedPerUser = result.value.toI32();
  } else {
    log.error("Error fetching Parts max stakeable per user: {}", [
      address.toHexString(),
    ]);
  }

  result = contract.try_maxStakeableTotal();
  if (!result.reverted) {
    harvester.maxPartsStaked = result.value.toI32();
  } else {
    log.error("Error fetching Parts max stakeable: {}", [
      address.toHexString(),
    ]);
  }

  harvester.save();
};

const processExtractorsStakingRules = (
  address: Address,
  harvester: Harvester
): void => {
  const contract = ExtractorsStakingRulesContract.bind(address);
  const result = contract.try_maxStakeable();
  if (!result.reverted) {
    harvester.maxExtractorsStaked = result.value.toI32();
    harvester.save();
  } else {
    log.error("Error fetching Extractors max stakeable: {}", [
      address.toHexString(),
    ]);
  }
};

const processLegionsStakingRules = (
  address: Address,
  harvester: Harvester
): void => {
  const contract = LegionsStakingRulesContract.bind(address);

  let result = contract.try_maxStakeableTotal();
  if (!result.reverted) {
    harvester.maxLegionsStaked = result.value.toI32();
  } else {
    log.error("Error fetching Legions max stakeable: {}", [
      address.toHexString(),
    ]);
  }

  result = contract.try_maxLegionWeight();
  if (!result.reverted) {
    harvester.maxLegionsWeightPerUser = result.value;
  } else {
    log.error("Error fetching Legions max weight: {}", [address.toHexString()]);
  }

  harvester.save();
};

const processERC721StakingRules = (
  address: Address,
  harvester: Harvester
): void => {
  const contract = ERC721StakingRulesContract.bind(address);

  let result = contract.try_maxStakeableTotal();
  if (!result.reverted) {
    harvester.maxLegionsStaked = result.value.toI32();
  } else {
    log.error("Error fetching ERC721 max stakeable: {}", [
      address.toHexString(),
    ]);
  }

  result = contract.try_maxWeight();
  if (!result.reverted) {
    harvester.maxLegionsWeightPerUser = result.value;
  } else {
    log.error("Error fetching ERC721 max weight: {}", [address.toHexString()]);
  }

  harvester.save();
};

const processTreasuresStakingRules = (
  address: Address,
  harvester: Harvester
): void => {
  const contract = TreasuresStakingRulesContract.bind(address);

  let result = contract.try_maxStakeablePerUser();
  if (!result.reverted) {
    harvester.maxTreasuresStakedPerUser = result.value.toI32();
  } else {
    log.error("Error fetching Treasures max stakeable: {}", [
      address.toHexString(),
    ]);
  }

  harvester.save();
};

export function handleUpdatedPartsBoostFactor(event: BoostFactor): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.partsBoostFactor = event.params.boostFactor;
  harvester.save();
}

export function handleUpdatedPartsMaxStakeablePerUser(
  event: MaxStakeablePerUser
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxPartsStakedPerUser = event.params.maxStakeablePerUser.toI32();
  harvester.save();
}

export function handleUpdatedPartsStakeableTotal(
  event: MaxStakeableTotal
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxPartsStaked = event.params.maxStakeableTotal.toI32();
  harvester.save();
}

export function handleUpdatedExtractorsMaxStakeable(event: MaxStakeable): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxExtractorsStaked = event.params.maxStakeable.toI32();
  harvester.save();
}

export function handleUpdatedLegionsMaxStakeableTotal(
  event: MaxStakeableTotal
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsStaked = event.params.maxStakeableTotal.toI32();
  harvester.save();
}

export function handleUpdatedLegionsMaxWeight(event: MaxWeight): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsWeightPerUser = event.params.maxLegionWeight;
  harvester.save();
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
  harvester.save();
}

export function handleUpdatedERC721MaxStakeableTotal(
  event: ERC721MaxStakeableTotal
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsStaked = event.params.maxStakeableTotal.toI32();
  harvester.save();
}

export function handleUpdatedERC721MaxWeight(event: ERC721MaxWeight): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxLegionsWeightPerUser = event.params.maxWeight;
  harvester.save();
}
