import { newMockEvent } from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  QuestFinished,
  QuestRevealed,
  QuestStarted,
} from "../../generated/Questing/Questing";

export const createQuestStartedEvent = (
  timestamp: i32,
  user: string,
  tokenId: i32,
  requestId: i32,
  difficulty: i32
): QuestStarted => {
  const event = changetype<QuestStarted>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_finishTime", ethereum.Value.fromI32(0)),
    new ethereum.EventParam("_difficulty", ethereum.Value.fromI32(difficulty)),
  ];

  return event;
};

export const createQuestRevealedEvent = (
  timestamp: i32,
  user: string,
  tokenId: i32,
  starlights: i32 = 0,
  crystals: i32 = 0,
  locks: i32 = 0,
  treasureId: i32 = 0
): QuestRevealed => {
  const event = changetype<QuestRevealed>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
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

  return event;
};

export const createQuestFinishedEvent = (
  timestamp: i32,
  user: string,
  tokenId: i32
): QuestFinished => {
  const event = changetype<QuestFinished>(newMockEvent());
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return event;
};
