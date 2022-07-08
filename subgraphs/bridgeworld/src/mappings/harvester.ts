import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import { Harvester, HarvesterNftHandler } from "../../generated/schema";
import {
  HarvesterConfig,
  Harvester as HarvesterTemplate,
  NftHandler,
  NftHandlerConfig,
} from "../../generated/templates";
import {
  Deposit,
  Harvest,
  Withdraw,
} from "../../generated/templates/Harvester/Harvester";
import {
  Replaced,
  Staked,
  Unstaked,
} from "../../generated/templates/NftHandler/NftHandler";
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

  const nftAddress = event.params.nft;
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

  const nftAddress = event.params.nft;
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

export function handleMagicDeposited(event: Deposit): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }
}

export function handleMagicWithdrawn(event: Withdraw): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }
}

export function handleMagicHarvested(event: Harvest): void {
  const harvester = getHarvester(event.address);
  if (!harvester) {
    return;
  }
}
