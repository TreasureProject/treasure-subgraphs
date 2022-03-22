import {
  TransferBatch,
  TransferSingle,
} from "../../generated/TreasureMarketplace/ERC1155";
import { createErc1155Collection } from "../helpers";
import * as common from "../mapping";

export function handleTransferSingle(event: TransferSingle): void {
  createErc1155Collection(event.address, "Balancer Crystal");

  common.handleTransferSingle(event);
}

export function handleTransferBatch(event: TransferBatch): void {
  createErc1155Collection(event.address, "Balancer Crystal");

  common.handleTransferBatch(event);
}
