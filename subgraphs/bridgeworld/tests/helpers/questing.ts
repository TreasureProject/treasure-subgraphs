import { newMockEvent } from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import * as questingLegacy from "../../generated/Questing Legacy/Questing";
import {
  QPGained,
  QuestFinished,
  QuestRevealed,
  QuestStarted,
} from "../../generated/Questing/Questing";
import { QUESTING_ADDRESS } from "./constants";

const _createQuestStartedEvent = (
  user: string,
  tokenId: i32,
  requestId: i32,
  difficulty: i32 = -1
): ethereum.Event => {
  const newEvent = newMockEvent();
  newEvent.address = Address.fromString(QUESTING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_finishTime", ethereum.Value.fromI32(0)),
  ];

  if (difficulty != -1) {
    newEvent.parameters.push(
      new ethereum.EventParam("_difficulty", ethereum.Value.fromI32(difficulty))
    );
  }

  return newEvent;
};

export const createQuestStartedEvent = (
  user: string,
  tokenId: i32,
  requestId: i32,
  difficulty: i32
): QuestStarted => {
  const newEvent = changetype<QuestStarted>(
    _createQuestStartedEvent(user, tokenId, requestId, difficulty)
  );

  return newEvent;
};

export const createQuestStartedWithoutDifficultyEvent = (
  user: string,
  tokenId: i32,
  requestId: i32
): questingLegacy.QuestStarted => {
  const newEvent = changetype<questingLegacy.QuestStarted>(
    _createQuestStartedEvent(user, tokenId, requestId)
  );

  return newEvent;
};

export const createQuestRevealedEvent = (
  user: string,
  tokenId: i32,
  starlights: i32 = 0,
  crystals: i32 = 0,
  locks: i32 = 0,
  treasureId: i32 = 0,
  blockNumber: i32 = 0
): QuestRevealed => {
  const newEvent = changetype<QuestRevealed>(newMockEvent());
  newEvent.address = Address.fromString(QUESTING_ADDRESS);
  if (blockNumber > 0) {
    newEvent.block.number = BigInt.fromI32(blockNumber);
  }
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam(
      "_reward",
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromI32(starlights),
          ethereum.Value.fromI32(crystals),
          ethereum.Value.fromI32(locks),
          ethereum.Value.fromI32(treasureId),
        ])
      )
    ),
  ];

  return newEvent;
};

export const createQuestFinishedEvent = (
  user: string,
  tokenId: i32
): QuestFinished => {
  const newEvent = changetype<QuestFinished>(newMockEvent());
  newEvent.address = Address.fromString(QUESTING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return newEvent;
};

export const createQuestXpGainedEvent = (
  tokenId: i32,
  questLevel: i32,
  qpFinal: i32
): QPGained => {
  const event = changetype<QPGained>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_questLevel", ethereum.Value.fromI32(questLevel)),
    new ethereum.EventParam("_qpFinal", ethereum.Value.fromI32(qpFinal)),
  ];

  return event;
};
