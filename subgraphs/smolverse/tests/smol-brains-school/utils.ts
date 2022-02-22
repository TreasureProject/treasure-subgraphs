import { newMockEvent } from "matchstick-as";

import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  DropSchool,
  JoinSchool,
} from "../../generated/Smol Brains School/School";

export function createJoinSchoolEvent(owner: string, tokenId: i32): JoinSchool {
  const event = changetype<JoinSchool>(newMockEvent());
  event.transaction.from = Address.fromString(owner);
  event.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];
  return event;
}

export function createDropSchoolEvent(owner: string, tokenId: i32): DropSchool {
  const event = changetype<DropSchool>(newMockEvent());
  event.transaction.from = Address.fromString(owner);
  event.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];
  return event;
}
