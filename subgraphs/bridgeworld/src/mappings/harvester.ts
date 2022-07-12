import { BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import {
  Deposit,
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
  Deposit as DepositEvent,
  Harvest as HarvestEvent,
  Withdraw as WithdrawEvent,
} from "../../generated/templates/Harvester/Harvester";
import {
  Replaced,
  Staked,
  Unstaked,
} from "../../generated/templates/NftHandler/NftHandler";
import { LOCK_PERIOD_IN_SECONDS, getAddressId } from "../helpers";
import { getHarvester, getHarvesterForNftHandler } from "../helpers/harvester";

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

export function handleNftStaked(event: Staked): void {
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
  let stakedToken = StakedToken.load(stakedTokenId);
  if (!stakedToken) {
    stakedToken = new StakedToken(stakedTokenId);
    stakedToken.user = userAddress.toHexString();
    stakedToken.token = getAddressId(nftAddress, params.tokenId);
    stakedToken.harvester = harvester.id;
  }

  stakedToken.quantity = stakedToken.quantity.plus(params.amount);
  stakedToken.save();

  if (nftAddress.equals(CONSUMABLE_ADDRESS)) {
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
  } else if (nftAddress.equals(TREASURE_ADDRESS)) {
  }
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

  if (nftAddress.equals(CONSUMABLE_ADDRESS)) {
  } else if (nftAddress.equals(LEGION_ADDRESS)) {
  } else if (nftAddress.equals(TREASURE_ADDRESS)) {
  }
}

export function handleExtractorReplaced(event: Replaced): void {
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
  const deposit = new Deposit(getAddressId(userAddress, params.index));
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
  const id = getAddressId(userAddress, params.index);

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
}
