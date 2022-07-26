import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { CONSUMABLE_ADDRESS, LEGION_ADDRESS } from "@treasure/constants";

import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import {
  Deposit,
  Harvest,
  Harvester,
  HarvesterNftHandler,
  StakedToken,
  Withdraw,
} from "../../generated/schema";
import {
  HarvesterConfig,
  Harvester as HarvesterTemplate,
  NftHandler,
  NftHandlerConfig,
} from "../../generated/templates";
import {
  ExtractorReplaced,
  ExtractorStaked,
} from "../../generated/templates/ExtractorsStakingRules/ExtractorsStakingRules";
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
  LOCK_PERIOD_IN_SECONDS,
  getAddressId,
} from "../helpers";
import {
  calculateHarvesterLegionsBoost,
  calculateHarvesterPartsBoost,
  getHarvester,
  getHarvesterForNftHandler,
  getHarvesterForStakingRule,
} from "../helpers/harvester";
import { getLegionMetadata } from "../helpers/legion";

export function handleHarvesterDeployed(event: HarvesterDeployed): void {
  const params = event.params;

  // Create Harvester entity
  const harvesterAddress = params.harvester;
  const harvester = new Harvester(harvesterAddress.toHexString());
  harvester.deployedBlockNumber = event.block.number;
  harvester.save();

  // Start listening for Harvester events at this address
  HarvesterConfig.create(harvesterAddress);
  HarvesterTemplate.create(harvesterAddress);

  // Create NftHandler entity
  const nftHandlerAddress = params.nftHandler;
  const nftHandler = new HarvesterNftHandler(nftHandlerAddress.toHexString());
  nftHandler.harvester = harvester.id;
  nftHandler.save();

  // Start listening for NftHandler events at this address
  NftHandlerConfig.create(nftHandlerAddress);
  NftHandler.create(nftHandlerAddress);
}

const handleTokenStaked = (
  harvester: Harvester,
  userAddress: Address,
  nftAddress: Address,
  tokenId: BigInt,
  amount: BigInt
): StakedToken => {
  const stakedTokenId = `${
    harvester.id
  }-${userAddress.toHexString()}-${getAddressId(nftAddress, tokenId)}`;
  let stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);
    stakedToken.user = userAddress.toHexString();
    stakedToken.token = getAddressId(nftAddress, tokenId);
    stakedToken.harvester = harvester.id;
  }

  stakedToken.quantity = stakedToken.quantity.plus(amount);
  return stakedToken;
};

export function handleNftStaked(event: Staked): void {
  const params = event.params;
  const nftAddress = params.nft;
  const tokenId = params.tokenId;
  const isConsumable = nftAddress.equals(CONSUMABLE_ADDRESS);
  if (isConsumable && HARVESTER_EXTRACTOR_TOKEN_IDS.includes(tokenId)) {
    // Extractors will be handled separately because they require the spotId param
    return;
  }

  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const stakedToken = handleTokenStaked(
    harvester,
    event.transaction.from,
    nftAddress,
    tokenId,
    params.amount
  );
  stakedToken.save();

  const amount = params.amount.toI32();
  if (isConsumable && tokenId.equals(HARVESTER_PART_TOKEN_ID)) {
    harvester.partsStaked += amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
    harvester.legionsStaked += amount;

    const metadata = getLegionMetadata(tokenId);
    harvester.legionsTotalRank = harvester.legionsTotalRank.plus(
      metadata.harvestersRank.times(params.amount)
    );
    harvester.legionsBoost = calculateHarvesterLegionsBoost(harvester);
  }

  harvester.save();
}

export function handleNftUnstaked(event: Unstaked): void {
  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const userAddress = event.transaction.from;
  const params = event.params;
  const nftAddress = params.nft;

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
    nftAddress.equals(CONSUMABLE_ADDRESS) &&
    params.tokenId.equals(HARVESTER_PART_TOKEN_ID)
  ) {
    // Extractors cannot be unstaked
    harvester.partsStaked -= amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
    harvester.legionsStaked -= amount;

    const metadata = getLegionMetadata(params.tokenId);
    harvester.legionsTotalRank = harvester.legionsTotalRank.minus(
      metadata.harvestersRank.times(params.amount)
    );
    harvester.legionsBoost = calculateHarvesterLegionsBoost(harvester);
  }

  harvester.save();
}

export function handleExtractorStaked(event: ExtractorStaked): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const tokenId = params.tokenId;
  const stakedToken = handleTokenStaked(
    harvester,
    event.transaction.from,
    CONSUMABLE_ADDRESS,
    tokenId,
    params.amount
  );
  stakedToken.expirationTime = event.block.timestamp.plus(
    harvester.extractorsLifetime
  );
  stakedToken.index = params.spotId.toI32();
  stakedToken.save();

  harvester.extractorsStaked += params.amount.toI32();
  harvester.save();
}

export function handleExtractorReplaced(event: ExtractorReplaced): void {
  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }
}

export function handleMagicDeposited(event: DepositEvent): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const userAddress = params.user;
  const lock = params.lock.toI32();

  // Save deposit
  const deposit = new Deposit(
    `${harvester.id}-${getAddressId(userAddress, params.index)}`
  );
  deposit.amount = params.amount;
  deposit.depositId = params.index;
  deposit.endTimestamp = event.block.timestamp
    .plus(BigInt.fromI32(LOCK_PERIOD_IN_SECONDS[lock]))
    .times(BigInt.fromI32(1000));
  deposit.lock = lock;
  deposit.harvester = harvester.id;
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
