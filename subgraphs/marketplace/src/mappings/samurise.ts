import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/TreasureMarketplace/ERC1155";
import { createErc721Collection, createErc1155Collection } from "../helpers";
import * as common from "../mapping";

export function handleTransferSingle(event: TransferSingle): void {
  createErc1155Collection(event.address, "SamuRise Items");

  common.handleTransferSingle(event);
}

export function handleTransferBatch(event: TransferBatch): void {
  createErc1155Collection(event.address, "SamuRise Items");

  common.handleTransferBatch(event);
}

export function handleTransfer(event: Transfer): void {
  createErc721Collection(event.address, "SamuRise Land");

  common.handleTransfer721(event);
}
