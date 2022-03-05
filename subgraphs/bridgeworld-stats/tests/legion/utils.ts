import { newMockEvent } from "matchstick-as";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import { LegionCreated } from "../../generated/Legion Metadata Store/LegionMetadataStore";

export function createLegionCreatedEvent(
  tokenId: i32,
  generation: i32,
  rarity: i32,
  legionClass: i32 = 0
): LegionCreated {
  const event = changetype<LegionCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.zero())
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_generation", ethereum.Value.fromI32(generation)),
    new ethereum.EventParam("_class", ethereum.Value.fromI32(legionClass)),
    new ethereum.EventParam("_rarity", ethereum.Value.fromI32(rarity)),
  ];

  return event;
}
