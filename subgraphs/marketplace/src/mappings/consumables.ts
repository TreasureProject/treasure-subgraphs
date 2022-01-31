import * as common from "../mapping";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/TreasureMarketplace/ERC1155";
import { createErc1155Collection } from "../helpers";

export function handleTransferSingle(event: TransferSingle): void {
  createErc1155Collection(event.address, "Consumables");

  common.handleTransferSingle(event);
}

export function handleTransferBatch(event: TransferBatch): void {
  createErc1155Collection(event.address, "Consumables");

  common.handleTransferBatch(event);
}