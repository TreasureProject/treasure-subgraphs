import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { createErc721Collection } from "../helpers";
import * as common from "../mapping";

export function handleTransfer(event: Transfer): void {
  createErc721Collection(event.address, "Peek-A-Boo");

  common.handleTransfer721(event);
}