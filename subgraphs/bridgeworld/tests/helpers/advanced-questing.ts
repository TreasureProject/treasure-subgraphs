import {
  clearStore,
  createMockedFunction,
  newMockEvent,
} from "matchstick-as/assembly";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ADVANCED_QUESTING_ADDRESS, LEGION_ADDRESS } from "@treasure/constants";

import {
  AdvancedQuestContinued,
  AdvancedQuestEnded,
  AdvancedQuestStarted,
  TreasureTriadPlayed,
} from "../../generated/Advanced Questing/AdvancedQuesting";
import { AdvancedQuestReward } from "../../generated/schema";
import {
  handleAdvancedQuestContinued,
  handleAdvancedQuestEnded,
  handleAdvancedQuestStarted,
  handleTreasureTriadPlayed,
} from "../../src/mappings/advanced-questing";
import { handleLegionCreated, handleTransfer } from "../../src/mappings/legion";
import {
  handleRandomRequest,
  handleRandomSeeded,
} from "../../src/mappings/randomizer";
import { USER_ADDRESS } from "./constants";
import { createLegionCreatedEvent, createLegionTransferEvent } from "./legion";
import {
  createRandomRequestEvent,
  createRandomSeededEvent,
} from "./randomizer";

export function advancedQuestingSetup(legionId: i32): string {
  clearStore();

  handleRandomRequest(createRandomRequestEvent(1, 1));

  handleTransfer(
    createLegionTransferEvent(Address.zero().toHexString(), USER_ADDRESS, 1)
  );

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);
  handleLegionCreated(legionCreatedEvent);

  return `${LEGION_ADDRESS.toHexString()}-${BigInt.fromI32(legionId).toHex()}`;
}

export function simulateAdvancedQuest(
  user: string = USER_ADDRESS,
  legionId: i32 = 1,
  requestId: i32 = 1,
  parts: i8 = 1,
  endQuest: boolean = true,
  playTreasureTriad: boolean = false
): void {
  handleAdvancedQuestStarted(
    createAdvancedQuestStartedEvent(user, legionId, requestId)
  );

  for (let part = 1; part < parts; part++) {
    handleAdvancedQuestContinued(
      createAdvancedQuestContinuedEvent(user, legionId, requestId, part)
    );
  }

  if (playTreasureTriad) {
    handleTreasureTriadPlayed(createTreasureTriadPlayedEvent(user, legionId));
  }

  if (endQuest) {
    handleAdvancedQuestEnded(createAdvancedQuestEndedEvent(user, legionId));
  }
}

export function createAdvancedQuestStartedEvent(
  user: string = USER_ADDRESS,
  legionId: i32 = 1,
  requestId: i32 = 1,
  zoneName: string = "A",
  toPart: i8 = 0,
  treasureIds: i32[] = [1, 2, 3],
  treasureAmounts: i32[] = [1, 1, 1]
): AdvancedQuestStarted {
  const newEvent = newMockEvent();
  newEvent.address = ADVANCED_QUESTING_ADDRESS;

  const startQuestParams = new ethereum.Tuple(5);
  startQuestParams[0] = ethereum.Value.fromI32(legionId);
  startQuestParams[1] = ethereum.Value.fromString(zoneName);
  startQuestParams[2] = ethereum.Value.fromI32(toPart);
  startQuestParams[3] = ethereum.Value.fromI32Array(treasureIds);
  startQuestParams[4] = ethereum.Value.fromI32Array(treasureAmounts);

  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam(
      "_startQuestParams",
      ethereum.Value.fromTuple(startQuestParams)
    ),
  ];

  return changetype<AdvancedQuestStarted>(newEvent);
}

export function createAdvancedQuestContinuedEvent(
  user: string = USER_ADDRESS,
  legionId: i32 = 1,
  requestId: i32 = 1,
  toPart: i32 = 1
): AdvancedQuestContinued {
  const newEvent = newMockEvent();
  newEvent.address = ADVANCED_QUESTING_ADDRESS;
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_legionId", ethereum.Value.fromI32(legionId)),
    new ethereum.EventParam("_requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("_toPart", ethereum.Value.fromI32(toPart)),
  ];

  return changetype<AdvancedQuestContinued>(newEvent);
}

export function createAdvancedQuestEndedEvent(
  user: string = USER_ADDRESS,
  legionId: i32 = 1,
  rewards: AdvancedQuestReward[] = []
): AdvancedQuestEnded {
  const newEvent = newMockEvent();
  newEvent.address = ADVANCED_QUESTING_ADDRESS;

  const rewardsTupleArray: Array<ethereum.Tuple> = rewards.map<ethereum.Tuple>(
    (reward) => {
      const tuple = new ethereum.Tuple(4);
      tuple[0] = ethereum.Value.fromUnsignedBigInt(reward.consumableId);
      tuple[1] = ethereum.Value.fromUnsignedBigInt(reward.consumableAmount);
      tuple[2] = ethereum.Value.fromUnsignedBigInt(reward.treasureFragmentId);
      tuple[3] = ethereum.Value.fromUnsignedBigInt(reward.treasureId);
      return tuple;
    }
  );

  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_legionId", ethereum.Value.fromI32(legionId)),
    new ethereum.EventParam(
      "_rewards",
      ethereum.Value.fromTupleArray(rewardsTupleArray)
    ),
  ];

  return changetype<AdvancedQuestEnded>(newEvent);
}

export function createTreasureTriadPlayedEvent(
  user: string = USER_ADDRESS,
  legionId: i32 = 1,
  playerWon: boolean = true,
  numberOfCardsFlipped: i32 = 3,
  numberOfCorruptedCardsRemaining: i32 = 0
): TreasureTriadPlayed {
  const newEvent = newMockEvent();
  newEvent.address = ADVANCED_QUESTING_ADDRESS;
  newEvent.parameters = [
    new ethereum.EventParam(
      "_owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("_legionId", ethereum.Value.fromI32(legionId)),
    new ethereum.EventParam(
      "_playerWon",
      ethereum.Value.fromBoolean(playerWon)
    ),
    new ethereum.EventParam(
      "_numberOfCardsFlipped",
      ethereum.Value.fromI32(numberOfCardsFlipped)
    ),
    new ethereum.EventParam(
      "_numberOfCorruptedCardsRemaining",
      ethereum.Value.fromI32(numberOfCorruptedCardsRemaining)
    ),
  ];

  return changetype<TreasureTriadPlayed>(newEvent);
}

export function mockEndTimeForLegion(
  legionId: i32,
  endTime: i64,
  stasisHitCount: i32
): void {
  createMockedFunction(
    ADVANCED_QUESTING_ADDRESS,
    "endTimeForLegion",
    "endTimeForLegion(uint256):(uint256,uint8)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(legionId))])
    .returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI64(endTime)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(stasisHitCount)),
    ]);
}
