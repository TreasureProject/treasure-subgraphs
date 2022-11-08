import { newMockEvent } from "matchstick-as/assembly";

import { ethereum } from "@graphprotocol/graph-ts";

import {
  AscensionInfoSet,
  LevelUpInfoSet,
  MaxLevelSet,
  RecruitCanAscendToAuxChanged,
  RecruitTypeChanged,
  RecruitXPChanged,
} from "../../generated/Recruit Level/RecruitLevel";

export const createAscensionInfoSetEvent = (
  minimumLevelCadet: i32 = 3,
  numEoSCadet: i32 = 6,
  numPrismShardsCadet: i32 = 6,
  minimumLevelApprentice: i32 = 7,
  numEoSApprentice: i32 = 12,
  numPrismShardsApprentice: i32 = 12
): AscensionInfoSet => {
  const event = changetype<AscensionInfoSet>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "minimumLevelCadet",
      ethereum.Value.fromI32(minimumLevelCadet)
    ),
    new ethereum.EventParam("numEoSCadet", ethereum.Value.fromI32(numEoSCadet)),
    new ethereum.EventParam(
      "numPrismShardsCadet",
      ethereum.Value.fromI32(numPrismShardsCadet)
    ),
    new ethereum.EventParam(
      "minimumLevelApprentice",
      ethereum.Value.fromI32(minimumLevelApprentice)
    ),
    new ethereum.EventParam(
      "numEoSApprentice",
      ethereum.Value.fromI32(numEoSApprentice)
    ),
    new ethereum.EventParam(
      "numPrismShardsApprentice",
      ethereum.Value.fromI32(numPrismShardsApprentice)
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

export const createRecruitCanAscendToAuxChangedEvent = (
  tokenId: i32,
  canAscendToAux: boolean
): RecruitCanAscendToAuxChanged => {
  const event = changetype<RecruitCanAscendToAuxChanged>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam(
      "canAscendToAux",
      ethereum.Value.fromBoolean(canAscendToAux)
    ),
  ];
  return event;
};
