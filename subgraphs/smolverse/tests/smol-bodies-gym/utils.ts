import { Address, ethereum } from "@graphprotocol/graph-ts";

import { newMockEvent } from "matchstick-as";
import { DropGym, JoinGym } from "../../generated/Smol Bodies Gym/Gym";

export function createJoinGymEvent(
  owner: string,
  tokenId: i32
): JoinGym {
  const event = changetype<JoinGym>(newMockEvent());
  event.transaction.from = Address.fromString(owner);
  event.parameters = [new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))];
  return event;
}

export function createDropGymEvent(
  owner: string,
  tokenId: i32
): DropGym {
  const event = changetype<DropGym>(newMockEvent());
  event.transaction.from = Address.fromString(owner);
  event.parameters = [new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))];
  return event;
}
