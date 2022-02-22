import { Transfer } from "../../generated/Smol Cars/ERC721";
import * as ERC721 from "./721";

export function handleTransfer(event: Transfer): void {
  ERC721.handleTransfer(event, "Smol Cars");
}
