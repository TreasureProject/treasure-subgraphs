import { Address, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction, newMockEvent } from "matchstick-as";

import { Transfer } from "../../generated/Smol Brains/ERC721";

export function createTransferEvent(
  collectionAddress: Address,
  to: string,
  tokenId: i32
): Transfer {
  const event = changetype<Transfer>(newMockEvent());
  event.address = collectionAddress;
  event.parameters = [
    new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.zero())),
    new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))
  ];

  return event;
}

export function createMockedTokenUriFunction(collectionAddress: Address): void {
  createMockedFunction(collectionAddress, "tokenURI", "tokenURI(uint256):(string)")
    .withArgs([ethereum.Value.fromI32(1)])
    .returns([ethereum.Value.fromString("https://treasure-marketplace.mypinata.cloud/ipfs/QmZg7bqH36fnKUcmKDhqGm65j5hbFeDZcogoxxiFMLeybE/1/5")]);
}
