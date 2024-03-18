import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { CONSUMABLE_ADDRESS, LEGION_ADDRESS } from "@treasure/constants";

import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import {
  Deposit,
  Harvest,
  Harvester,
  HarvesterNftHandler,
  HarvesterTimelock,
  StakedToken,
  Withdraw,
} from "../../generated/schema";
import {
  HarvesterConfig,
  Harvester as HarvesterTemplate,
  NftHandler,
  NftHandlerConfig,
} from "../../generated/templates";
import { MaxStakeable as ExtractorMaxStakeableUpdated } from "../../generated/templates/ExtractorsStakingRules/ExtractorsStakingRules";
import {
  Deposit as DepositEvent,
  Harvest as HarvestEvent,
  Withdraw as WithdrawEvent,
} from "../../generated/templates/Harvester/Harvester";
import {
  Staked,
  Unstaked,
} from "../../generated/templates/NftHandler/NftHandler";
import {
  HARVESTER_EXTRACTOR_TOKEN_IDS,
  HARVESTER_PART_TOKEN_ID,
  ZERO_BI,
  getAddressId,
} from "../helpers";
import {
  calculateHarvesterPartsBoost,
  getHarvester,
  getHarvesterForNftHandler,
  getHarvesterForStakingRule,
  getOrCreateHarvesterConfig,
} from "../helpers/harvester";
import { getLegionMetadata } from "../helpers/legion";
import { weiToEther } from "../helpers/number";
import { getOrCreateToken } from "../helpers/token";

export function handleHarvesterDeployed(event: HarvesterDeployed): void {
  const params = event.params;

  // Create Harvester entity
  const harvesterAddress = params.harvester;
  const harvester = new Harvester(harvesterAddress);
  harvester.deployedBlockNumber = event.block.number;
  harvester.maxMagicDeposited = ZERO_BI;
  harvester.partsAddress = CONSUMABLE_ADDRESS;
  harvester.partsTokenId = HARVESTER_PART_TOKEN_ID;
  harvester.maxPartsStaked = 0;
  harvester.maxPartsStakedPerUser = 0;
  harvester.maxExtractorsStaked = 0;
  harvester.maxLegionsStaked = 0;
  harvester.maxLegionsWeightPerUser = ZERO_BI;
  harvester.maxTreasuresStakedPerUser = 0;
  harvester.magicDepositAllocationPerPart = ZERO_BI;
  harvester.magicDeposited = ZERO_BI;
  harvester.partsStaked = 0;
  harvester.partsBoostFactor = ZERO_BI;
  harvester.partsBoost = ZERO_BI;
  harvester.save();

  // Start listening for Harvester events at this address
  HarvesterConfig.create(harvesterAddress);
  HarvesterTemplate.create(harvesterAddress);

  // Create NftHandler entity
  const nftHandlerAddress = params.nftHandler;
  const nftHandler = new HarvesterNftHandler(nftHandlerAddress);
  nftHandler.harvester = harvester.id;
  nftHandler.save();

  // Start listening for NftHandler events at this address
  NftHandlerConfig.create(nftHandlerAddress);
  NftHandler.create(nftHandlerAddress);

  // Save Harvester to config
  const config = getOrCreateHarvesterConfig();
  config.harvesters = config.harvesters.concat([harvester.id]);
  config.save();
}

export function handleNftStaked(event: Staked): void {
  const params = event.params;
  const nftAddress = params.nft;
  const tokenId = params.tokenId;
  if (
    nftAddress.equals(CONSUMABLE_ADDRESS) &&
    HARVESTER_EXTRACTOR_TOKEN_IDS.includes(tokenId)
  ) {
    // Extractors won't be handled by the subgraph
    return;
  }

  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const token = getOrCreateToken(nftAddress, tokenId);
  const userAddress = params.user;
  const stakedTokenId = `${harvester.id}-${userAddress.toHexString()}-${
    token.id
  }`;
  let stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);
    stakedToken.user = userAddress.toHexString();
    stakedToken.token = token.id;
    stakedToken.quantity = ZERO_BI;
    stakedToken.harvester = harvester.id;
  }

  stakedToken.quantity = stakedToken.quantity.plus(params.amount);

  const amount = params.amount.toI32();
  if (
    nftAddress.equals(harvester.partsAddress) &&
    tokenId.equals(harvester.partsTokenId)
  ) {
    harvester.partsStaked += amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
    const metadata = getLegionMetadata(tokenId);
    stakedToken.index = weiToEther(metadata.harvestersRank) as i32;
  }

  stakedToken.save();
  harvester.save();
}

export function handleNftUnstaked(event: Unstaked): void {
  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const nftAddress = params.nft;
  const userAddress = params.user;

  const stakedTokenId = `${
    harvester.id
  }-${userAddress.toHexString()}-${getAddressId(nftAddress, params.tokenId)}`;
  const stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    log.error("Unstaking from unknown StakedToken: {}", [stakedTokenId]);
    return;
  }

  if (stakedToken.quantity.equals(params.amount)) {
    store.remove("StakedToken", stakedTokenId);
  } else {
    stakedToken.quantity = stakedToken.quantity.minus(params.amount);
    stakedToken.save();
  }

  const amount = params.amount.toI32();
  if (
    nftAddress.equals(harvester.partsAddress) &&
    params.tokenId.equals(harvester.partsTokenId)
  ) {
    harvester.partsStaked -= amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  }

  harvester.save();
}

export function handleExtractorMaxStakeableUpdated(
  event: ExtractorMaxStakeableUpdated
): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  harvester.maxExtractorsStaked = event.params.maxStakeable.toI32();
  harvester.save();
}

export function handleMagicDeposited(event: DepositEvent): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const userAddress = params.user;

  const timelock = HarvesterTimelock.load(
    harvester.id.concatI32(params.lock.toI32())
  );
  if (!timelock) {
    log.error("Unknown timelock option: {}", [params.lock.toString()]);
    return;
  }

  // Save deposit
  const deposit = new Deposit(
    `${harvester.id}-${getAddressId(userAddress, params.index)}`
  );
  deposit.transactionHash = event.transaction.hash;
  deposit.amount = params.amount;
  deposit.depositId = params.index;
  deposit.startTimestamp = event.block.timestamp.times(BigInt.fromI32(1000));
  deposit.endTimestamp = event.block.timestamp
    .plus(timelock.duration)
    .times(BigInt.fromI32(1000));
  deposit.harvester = harvester.id;
  deposit.harvesterTimelock = timelock.id;
  deposit.user = userAddress.toHexString();
  deposit.save();

  // Update Harvester with new deposit
  harvester.magicDeposited = harvester.magicDeposited.plus(params.amount);
  harvester.save();
}

export function handleMagicWithdrawn(event: WithdrawEvent): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const userAddress = params.user;
  const id = `${harvester.id}-${getAddressId(userAddress, params.index)}`;

  const deposit = Deposit.load(id);
  if (!deposit) {
    log.error("Withdrawing from unknown Deposit: {}", [id]);
    return;
  }

  // Save withdrawal
  let withdraw = Withdraw.load(id);
  if (!withdraw) {
    withdraw = new Withdraw(id);
    withdraw.deposit = deposit.id;
    withdraw.harvester = harvester.id;
    withdraw.user = userAddress.toHexString();
    withdraw.amount = ZERO_BI;
  }
  withdraw.amount = withdraw.amount.plus(params.amount);
  withdraw.save();

  // Update Deposit with new withdrawal
  deposit.withdrawal = id;
  deposit.save();

  // Update Harvester with new withdrawal
  harvester.magicDeposited = harvester.magicDeposited.minus(params.amount);
  harvester.save();
}

export function handleMagicHarvested(event: HarvestEvent): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const harvest = new Harvest(
    `${harvester.id}-${event.transaction.hash.toHexString()}`
  );
  harvest.harvester = harvester.id;
  harvest.user = params.user.toHexString();
  harvest.amount = params.amount;
  harvest.save();
}
