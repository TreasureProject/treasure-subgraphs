import * as ERC721 from "./721";
import { Transfer } from "../../generated/Smol Brains Land/ERC721";

export function handleTransfer(event: Transfer): void {
  ERC721.handleTransfer(event, "Smol Brains Land");
}
