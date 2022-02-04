import { newMockEvent } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";

import { SmolPetMint } from "../../generated/Smol Bodies Pets/SmolBodiesPets";

export const createSmolPetMintEvent = (
  to: string,
  tokenId: i32,
  tokenUri: string
): SmolPetMint => {
  const newEvent = changetype<SmolPetMint>(newMockEvent());
  newEvent.parameters = [
    new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("tokenURI", ethereum.Value.fromString(tokenUri))
  ];

  return newEvent;
};
