import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import { createErc721Collection } from "../helpers";
import { handleTransfer721 } from "../mapping";

export function handleTransfer(event: Transfer): void {
  createErc721Collection(event.address, "Imbued Souls");

  handleTransfer721(event);
}
