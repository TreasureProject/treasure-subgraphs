import { Transfer } from "../../generated/TreasureMarketplace/ERC721";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/TreasureMarketplace/ERC1155";
import { createErc721Collection, createErc1155Collection } from "../helpers";
import {
  handleTransfer721,
  handleTransferBatch,
  handleTransferSingle,
} from "../mapping";

export function handleTransfer(event: Transfer): void {
  createErc721Collection(event.address, "KOTE Squires");

  handleTransfer721(event);
}

export function handleTransferSingleRing(event: TransferSingle): void {
  createErc1155Collection(event.address, "KOTE Rings");

  handleTransferSingle(event);
}

export function handleTransferBatchRings(event: TransferBatch): void {
  createErc1155Collection(event.address, "KOTE Rings");

  handleTransferBatch(event);
}

export function handleTransferSingleTrinket(event: TransferSingle): void {
  createErc1155Collection(event.address, "KOTE Trinkets");

  handleTransferSingle(event);
}

export function handleTransferBatchTrinkets(event: TransferBatch): void {
  createErc1155Collection(event.address, "KOTE Trinkets");

  handleTransferBatch(event);
}

export function handleTransferSinglePotion(event: TransferSingle): void {
  createErc1155Collection(event.address, "KOTE Potions");

  handleTransferSingle(event);
}

export function handleTransferBatchPotions(event: TransferBatch): void {
  createErc1155Collection(event.address, "KOTE Potions");

  handleTransferBatch(event);
}
