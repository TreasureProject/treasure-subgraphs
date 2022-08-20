import { newMockEvent } from "matchstick-as/assembly";

import { ethereum } from "@graphprotocol/graph-ts";

import {
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";

export const createRecruitTypeChangedEvent = (
  tokenId: i32,
  type: i32
): RecruitTypeChanged => {
  const event = changetype<RecruitTypeChanged>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("recruitType", ethereum.Value.fromI32(type)),
  ];

  return event;
};

export const createRecruitXpChangedEvent = (
  tokenId: i32,
  level: i32,
  xp: i32
): RecruitXPChanged => {
  const event = changetype<RecruitXPChanged>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("levelCur", ethereum.Value.fromI32(level)),
    new ethereum.EventParam("expCur", ethereum.Value.fromI32(xp)),
  ];

  return event;
};
