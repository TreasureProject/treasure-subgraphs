import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { createErc721Collection } from "../helpers";
import * as common from "../mapping";

export function handleTransferBattlefly(event: Transfer): void {
  createErc721Collection(event.address, "BattleFly");

  common.handleTransfer721(event);
}

export function handleTransferFounder(event: Transfer): void {
  createErc721Collection(event.address, "BattleFly v1 Founders NFT");

  common.handleTransfer721(event);
}
