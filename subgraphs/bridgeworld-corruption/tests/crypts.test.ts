import {
  assert,
  beforeEach,
  clearStore,
  describe,
  newMockEvent,
  test,
} from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  LegionSquadStaked,
  LegionSquadUnstaked,
  TempleCreated,
} from "../generated/CorruptionCrypts/CorruptionCrypts";
import { LegionSquadStaked as LegionSquadStakedV2 } from "../generated/CorruptionCryptsV2/CorruptionCryptsV2";
import {
  handleCharacterSquadStaked,
  handleLegionSquadStaked,
  handleLegionSquadUnstaked,
  handleTempleCreated,
} from "../src/crypts";

const createTempleCreatedEvent = (templeId: i32 = 1): TempleCreated => {
  const event = changetype<TempleCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("thisTempleId", ethereum.Value.fromI32(templeId)),
    new ethereum.EventParam(
      "_thisHarvester",
      ethereum.Value.fromAddress(Address.zero())
    ),
  ];

  return event;
};

const createLegionSquadStakedEvent = (
  legionIds: i32[],
  squadId: i32 = 1,
  targetTemple: i32 = 1
): LegionSquadStaked => {
  const event = changetype<LegionSquadStaked>(newMockEvent());
  event.block.timestamp = BigInt.zero();
  event.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.zero())
    ),
    new ethereum.EventParam("_legionSquadId", ethereum.Value.fromI32(squadId)),
    new ethereum.EventParam(
      "_legionIds",
      ethereum.Value.fromI32Array(legionIds)
    ),
    new ethereum.EventParam(
      "_targetTemple",
      ethereum.Value.fromI32(targetTemple)
    ),
    new ethereum.EventParam(
      "_legionSquadName",
      ethereum.Value.fromString("Test Squad")
    ),
  ];

  return event;
};

const createLegionSquadStakedV2Event = (
  characters: ethereum.Tuple[],
  squadId: i32 = 1,
  targetTemple: i32 = 1
): LegionSquadStakedV2 => {
  const event = changetype<LegionSquadStakedV2>(newMockEvent());
  event.block.timestamp = BigInt.zero();
  event.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.zero())
    ),
    new ethereum.EventParam("_legionSquadId", ethereum.Value.fromI32(squadId)),
    new ethereum.EventParam(
      "_characters",
      ethereum.Value.fromTupleArray(characters)
    ),
    new ethereum.EventParam(
      "_targetTemple",
      ethereum.Value.fromI32(targetTemple)
    ),
    new ethereum.EventParam(
      "_legionSquadName",
      ethereum.Value.fromString("Test Squad")
    ),
  ];

  return event;
};

const createLegionSquadUnstakedEvent = (
  squadId: i32 = 1
): LegionSquadUnstaked => {
  const event = changetype<LegionSquadUnstaked>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "_user",
      ethereum.Value.fromAddress(Address.zero())
    ),
    new ethereum.EventParam("_legionSquadId", ethereum.Value.fromI32(squadId)),
  ];

  return event;
};

describe("crypts handlers", () => {
  beforeEach(() => {
    clearStore();
    handleTempleCreated(createTempleCreatedEvent());
  });

  test("update active legions count", () => {
    handleLegionSquadStaked(createLegionSquadStakedEvent([1, 2, 3], 1));
    assert.fieldEquals("Config", "0x01000000", "cryptsLegionsActive", "3");

    handleLegionSquadUnstaked(createLegionSquadUnstakedEvent(1));
    assert.fieldEquals("Config", "0x01000000", "cryptsLegionsActive", "0");

    handleLegionSquadStaked(createLegionSquadStakedEvent([1, 2, 3], 2));
    assert.fieldEquals("Config", "0x01000000", "cryptsLegionsActive", "3");

    handleCharacterSquadStaked(
      createLegionSquadStakedV2Event(
        [
          changetype<ethereum.Tuple>([
            ethereum.Value.fromAddress(Address.zero()),
            ethereum.Value.fromI32(1),
          ]),
          changetype<ethereum.Tuple>([
            ethereum.Value.fromAddress(Address.zero()),
            ethereum.Value.fromI32(2),
          ]),
        ],
        3
      )
    );
    assert.fieldEquals("Config", "0x01000000", "cryptsLegionsActive", "5");

    handleLegionSquadUnstaked(createLegionSquadUnstakedEvent(2));
    assert.fieldEquals("Config", "0x01000000", "cryptsLegionsActive", "2");
  });
});
