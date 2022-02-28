import { newMockEvent } from "matchstick-as/assembly";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { Transfer } from "../../generated/Legion/ERC721";
import { TransferBatch } from "../../generated/Treasure/ERC1155";

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const newEvent = changetype<Transfer>(newMockEvent());
  newEvent.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};

export const createBatchTransferEvent = (
  operator: Address,
  from: string,
  to: string,
  ids: i32[],
  amounts: i32[]
): TransferBatch => {
  const newEvent = changetype<TransferBatch>(newMockEvent());
  newEvent.parameters = [
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator)),
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("ids", ethereum.Value.fromI32Array(ids)),
    new ethereum.EventParam("values", ethereum.Value.fromI32Array(amounts)),
  ];

  return newEvent;
};
