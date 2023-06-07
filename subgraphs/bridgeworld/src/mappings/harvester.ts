import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  BEACON_ADDRESS,
  CONSUMABLE_ADDRESS,
  KOTE_SQUIRES_ADDRESS,
  LEGION_ADDRESS,
} from "@treasure/constants";

import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import {
  Deposit,
  Harvest,
  Harvester,
  HarvesterNftHandler,
  HarvesterTimelock,
  HarvesterTokenBoost,
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
  ONE_BI,
  ZERO_BI,
  getAddressId,
} from "../helpers";
import {
  calculateHarvesterLegionsBoost,
  calculateHarvesterPartsBoost,
  createStakedExtractorId,
  getHarvester,
  getHarvesterForNftHandler,
  getHarvesterForStakingRule,
  getOrCreateHarvesterConfig,
  removeExpiredExtractors,
} from "../helpers/harvester";
import { getLegionMetadata } from "../helpers/legion";
import { weiToEther } from "../helpers/number";
import { getOrCreateToken } from "../helpers/token";
import { HARVESTERS_RANK_MATRIX } from "./legion";

export function handleHarvesterDeployed(event: HarvesterDeployed): void {
  const params = event.params;

  // Create Harvester entity
  const harvesterAddress = params.harvester;
  const harvester = new Harvester(harvesterAddress);
  harvester.deployedBlockNumber = event.block.number;
  harvester.maxMagicDeposited = ZERO_BI;
  harvester.maxPartsStaked = 0;
  harvester.maxPartsStakedPerUser = 0;
  harvester.maxExtractorsStaked = 0;
  harvester.maxLegionsStaked = 0;
  harvester.maxLegionsWeightPerUser = ZERO_BI;
  harvester.maxTreasuresStakedPerUser = 0;
  harvester.magicDepositAllocationPerPart = ZERO_BI;
  harvester.magicDeposited = ZERO_BI;
  harvester.partsStaked = 0;
  harvester.extractorsStaked = 0;
  harvester.extractorsLifetime = ZERO_BI;
  harvester.legionsStaked = 0;
  harvester.otherCharactersStaked = ZERO_BI;
  harvester.partsBoostFactor = ZERO_BI;
  harvester.partsBoost = ZERO_BI;
  harvester.extractorsBoost = ZERO_BI;
  harvester.legionsTotalRank = ZERO_BI;
  harvester.legionsBoost = ZERO_BI;
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
    // Extractors will be handled separately because they require the spotId param
    return;
  }

  const harvester = getHarvesterForNftHandler(event.address);
  if (!harvester) {
    return;
  }

  const token = getOrCreateToken(nftAddress, tokenId);
  const isKoteSquire = nftAddress.equals(KOTE_SQUIRES_ADDRESS);
  if (isKoteSquire) {
    token.category = "KoteSquire";
    token.name = "KOTE Squire";
    token.save();
  }

  const isBeaconPet = nftAddress.equals(BEACON_ADDRESS);
  if (isBeaconPet) {
    token.category = "BeaconPet";
    token.name = "The Beacon Pet";
    token.save();
  }

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
    stakedToken.expirationProcessed = false;
  }

  stakedToken.quantity = stakedToken.quantity.plus(params.amount);

  const amount = params.amount.toI32();
  const partsAddress = harvester.partsAddress || CONSUMABLE_ADDRESS;
  const partsTokenId = harvester.partsTokenId || HARVESTER_PART_TOKEN_ID;
  if (
    nftAddress.equals(partsAddress as Bytes) &&
    tokenId.equals(partsTokenId as BigInt)
  ) {
    harvester.partsStaked += amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS) || isKoteSquire) {
    harvester.legionsStaked += amount;

    if (isKoteSquire) {
      harvester.legionsTotalRank = harvester.legionsTotalRank.plus(
        HARVESTERS_RANK_MATRIX[1][4]
      );
    } else {
      const metadata = getLegionMetadata(tokenId);
      stakedToken.index = weiToEther(metadata.harvestersRank) as i32;
      harvester.legionsTotalRank = harvester.legionsTotalRank.plus(
        metadata.harvestersRank.times(params.amount)
      );
    }

    harvester.legionsBoost = calculateHarvesterLegionsBoost(harvester);
  } else if (isBeaconPet) {
    harvester.otherCharactersStaked = (
      (harvester.otherCharactersStaked || ZERO_BI) as BigInt
    ).plus(params.amount);
  }

  stakedToken.save();
  harvester.save();

  removeExpiredExtractors(harvester, event.block.timestamp);
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
  const isKoteSquire = nftAddress.equals(KOTE_SQUIRES_ADDRESS);
  const isBeaconPet = nftAddress.equals(BEACON_ADDRESS);
  const partsAddress = harvester.partsAddress || CONSUMABLE_ADDRESS;
  const partsTokenId = harvester.partsTokenId || HARVESTER_PART_TOKEN_ID;
  if (
    nftAddress.equals(partsAddress as Bytes) &&
    params.tokenId.equals(partsTokenId as BigInt)
  ) {
    // Extractors cannot be unstaked
    harvester.partsStaked -= amount;
    harvester.partsBoost = calculateHarvesterPartsBoost(harvester);
  } else if (nftAddress.equals(LEGION_ADDRESS) || isKoteSquire) {
    harvester.legionsStaked -= amount;

    if (isKoteSquire) {
      harvester.legionsTotalRank = harvester.legionsTotalRank.minus(
        HARVESTERS_RANK_MATRIX[1][4]
      );
    } else {
      const metadata = getLegionMetadata(params.tokenId);
      harvester.legionsTotalRank = harvester.legionsTotalRank.minus(
        metadata.harvestersRank.times(params.amount)
      );
    }

    harvester.legionsBoost = calculateHarvesterLegionsBoost(harvester);
  } else if (isBeaconPet) {
    harvester.otherCharactersStaked = (
      (harvester.otherCharactersStaked || ZERO_BI) as BigInt
    ).minus(params.amount);
  }

  harvester.save();

  removeExpiredExtractors(harvester, event.block.timestamp);
}

export function handleExtractorStaked(event: ExtractorStaked): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const tokenId = params.tokenId;
  const extractorId = getAddressId(CONSUMABLE_ADDRESS, tokenId);

  const tokenBoost = HarvesterTokenBoost.load(`${harvester.id}-${extractorId}`);
  if (!tokenBoost) {
    log.error("Extractor boost info not found: {}, {}", [
      harvester.id.toHexString(),
      tokenId.toString(),
    ]);
  }

  const tokenBoostAmount = tokenBoost ? tokenBoost.boost : ZERO_BI;

  const amount = params.amount.toI32();
  const expirationTime = event.block.timestamp.plus(
    harvester.extractorsLifetime
  );

  // Save Extractors as StakedTokens based on spotId instead of tokenId
  // Only one event is fired for multiple Extractors staked
  // Determine the starting spotId by subtracting the amount from the event's spotId
  const endSpotId = params.spotId.toI32();
  const startSpotId = endSpotId - (amount - 1);
  for (let spotId = startSpotId; spotId <= endSpotId; spotId++) {
    const stakedTokenId = createStakedExtractorId(harvester, spotId);
    let stakedToken = StakedToken.load(stakedTokenId);
    if (!stakedToken) {
      stakedToken = new StakedToken(stakedTokenId);
      stakedToken.harvester = harvester.id;
      stakedToken.index = spotId;
    }

    stakedToken.user = params.user.toHexString();
    stakedToken.token = extractorId;
    stakedToken.quantity = ONE_BI;
    stakedToken.expirationTime = expirationTime;
    stakedToken.expirationProcessed = false;
    stakedToken.save();
  }

  // Update staked Extractors count
  harvester.extractorsStaked += amount;

  // Update staked Extractors boost
  harvester.extractorsBoost = harvester.extractorsBoost.plus(
    tokenBoostAmount.times(params.amount)
  );

  // Update Harvester's next expiration time if this Extractor will expire sooner
  if (
    !harvester._nextExpirationTime ||
    expirationTime.lt(harvester._nextExpirationTime as BigInt)
  ) {
    harvester._nextExpirationTime = expirationTime;
  }

  harvester.save();

  removeExpiredExtractors(harvester, event.block.timestamp);
}

export function handleExtractorReplaced(event: ExtractorReplaced): void {
  const harvester = getHarvesterForStakingRule(event.address);
  if (!harvester) {
    return;
  }

  const params = event.params;
  const tokenId = params.tokenId;
  const stakedToken = StakedToken.load(
    createStakedExtractorId(harvester, params.replacedSpotId.toI32())
  );
  if (!stakedToken) {
    log.error("Replacing unknown Extractor spot ID: {}, {}", [
      harvester.id.toHexString(),
      params.replacedSpotId.toString(),
    ]);
    return;
  }

  const oldTokenBoost = HarvesterTokenBoost.load(
    `${harvester.id}-${stakedToken.token}`
  );
  if (!oldTokenBoost) {
    log.error("Extractor boost info not found: {}, {}", [
      harvester.id.toHexString(),
      stakedToken.token.toString(),
    ]);
  }

  const oldTokenBoostAmount = oldTokenBoost ? oldTokenBoost.boost : ZERO_BI;

  const newTokenId = getAddressId(CONSUMABLE_ADDRESS, tokenId);
  const newTokenBoost = HarvesterTokenBoost.load(
    `${harvester.id}-${newTokenId}`
  );
  if (!newTokenBoost) {
    log.error("Extractor boost info not found: {}, {}", [
      harvester.id.toHexString(),
      tokenId.toString(),
    ]);
  }

  const newTokenBoostAmount = newTokenBoost ? newTokenBoost.boost : ZERO_BI;

  const timestamp = event.block.timestamp;
  const oldExpirationTime = stakedToken.expirationTime;
  const newExpirationTime = timestamp.plus(harvester.extractorsLifetime);
  stakedToken.user = params.user.toHexString();
  stakedToken.token = newTokenId;
  stakedToken.quantity = ONE_BI;
  stakedToken.expirationTime = newExpirationTime;
  stakedToken.expirationProcessed = false;
  stakedToken.save();

  // Update staked Extractors boost
  let nextExtractorsBoost = harvester.extractorsBoost.plus(newTokenBoostAmount);
  // Subtract old boost if it wasn't expired yet
  if (oldExpirationTime && (oldExpirationTime as BigInt).gt(timestamp)) {
    nextExtractorsBoost = nextExtractorsBoost.minus(oldTokenBoostAmount);
  }
  harvester.extractorsBoost = nextExtractorsBoost.lt(ZERO_BI)
    ? ZERO_BI
    : nextExtractorsBoost;

  // Update Harvester's next expiration time if this Extractor will expire sooner
  if (
    !harvester._nextExpirationTime ||
    newExpirationTime.lt(harvester._nextExpirationTime as BigInt)
  ) {
    harvester._nextExpirationTime = newExpirationTime;
  }

  harvester.save();

  removeExpiredExtractors(harvester, timestamp);
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
