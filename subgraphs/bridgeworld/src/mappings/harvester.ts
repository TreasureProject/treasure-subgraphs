import { HarvesterDeployed } from "../../generated/Harvester Factory/HarvesterFactory";
import { Harvester, HarvesterNftHandler } from "../../generated/schema";
import { NftHandler } from "../../generated/templates";

export function handleHarvesterDeployed(event: HarvesterDeployed): void {
  const params = event.params;

  // Create Harvester entity
  const harvester = new Harvester(params.harvester.toHexString());
  harvester.deployedBlockNumber = event.block.number;
  harvester.save();

  // Create NftHandler entity
  const nftHandlerAddress = params.nftHandler;
  const nftHandler = new HarvesterNftHandler(nftHandlerAddress.toHexString());
  nftHandler.harvester = harvester.id;
  nftHandler.save();

  // Start listening for NftHandler events at this address
  NftHandler.create(nftHandlerAddress);
}
