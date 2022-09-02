import { newMockEvent } from "matchstick-as/assembly";

import { ethereum } from "@graphprotocol/graph-ts";

import {
  AscensionInfoSet,
  LevelUpInfoSet,
  MaxLevelSet,
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";

export const createAscensionInfoSetEvent = (
  minimumLevel: i32 = 3,
  numEoS: i32 = 6,
  numPrismShards: i32 = 6
): AscensionInfoSet => {
  const event = changetype<AscensionInfoSet>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "minimumLevel",
      ethereum.Value.fromI32(minimumLevel)
    ),
    new ethereum.EventParam("numEoS", ethereum.Value.fromI32(numEoS)),
    new ethereum.EventParam(
      "numPrismShards",
      ethereum.Value.fromI32(numPrismShards)
    ),
  ];
  return event;
};

export const createLevelUpInfoSetEvent = (
  level: i32,
  xpToNextLevel: i32
): LevelUpInfoSet => {
  const event = changetype<LevelUpInfoSet>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("levelCur", ethereum.Value.fromI32(level)),
    new ethereum.EventParam(
      "expToNextLevel",
      ethereum.Value.fromI32(xpToNextLevel)
    ),
  ];
  return event;
};

export const createMaxLevelSetEvent = (maxLevel: i32 = 7): MaxLevelSet => {
  const event = changetype<MaxLevelSet>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("maxLevel", ethereum.Value.fromI32(maxLevel)),
  ];
  return event;
};

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
