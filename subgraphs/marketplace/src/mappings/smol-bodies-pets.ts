import * as common from "../mapping";
import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { createErc721Collection } from "../helpers";

export function handleTransfer(event: Transfer): void {
  createErc721Collection(event.address, "Smol Bodies Pets");

  common.handleTransfer721(event);
}
