import { assert, clearStore, createMockedFunction, test } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import { Summon } from "../generated/schema";
import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import {
  handleRandomRequest,
  handleRandomSeeded,
} from "../src/mappings/randomizer";
import {
  handleSummoningFinished,
  handleSummoningStarted,
} from "../src/mappings/summoning";
import {
  LEGION_INFO_ENTITY_TYPE,
  SUMMONING_CIRCLE_ENTITY_TYPE,
  SUMMON_ENTITY_TYPE,
  SUMMON_FATIGUE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
  createLegionCreatedEvent,
  createLegionTransferEvent,
  createRandomRequestEvent,
  createRandomSeededEvent,
  createSummoningStartedEvent,
  createdSummoningFinishedEvent,
} from "./helpers/index";

test("summon is started and finished with result token", () => {
  clearStore();

  const randomRequestEvent = createRandomRequestEvent(0, 1);
  handleRandomRequest(randomRequestEvent);

  let mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    7
  );

  handleTransfer(mintEvent);

  mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    3822
  );

  handleTransfer(mintEvent);

  let legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 7, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 3822, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const summoningStartedEvent = createSummoningStartedEvent(
    USER_ADDRESS,
    7,
    0,
    1643659676,
    [7, 3822],
    [2, 0]
  );
  handleSummoningStarted(summoningStartedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x7`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");

  const summon = `${summoningStartedEvent.address.toHexString()}-0x7`;
  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "token", id);
  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "status", "Idle");

  createMockedFunction(
    SUMMONING_ADDRESS,
    "didSummoningSucceed",
    "didSummoningSucceed(uint256):(bool,uint256)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(7))])
    .returns([
      ethereum.Value.fromBoolean(true),
      ethereum.Value.fromI32(1644659676),
    ]);

  const seededEvent = createRandomSeededEvent(1);

  handleRandomSeeded(seededEvent);

  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "crafters", "0");
  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "summoners", "1");
  assert.fieldEquals(
    SUMMONING_CIRCLE_ENTITY_TYPE,
    "only",
    "successRate",
    "0.5"
  );

  const newMintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(newMintEvent);

  const newLegionCreatedEvent = createLegionCreatedEvent(
    USER_ADDRESS,
    1,
    1,
    1,
    4
  );
  handleLegionCreated(newLegionCreatedEvent);

  const summoningFinishedEvent = createdSummoningFinishedEvent(
    USER_ADDRESS,
    7,
    1,
    0
  );
  handleSummoningFinished(summoningFinishedEvent);

  const metadata = `${id}-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "1");

  assert.fieldEquals(
    SUMMON_ENTITY_TYPE,
    `${summon}-0x0`,
    "prismUsed",
    `${CONSUMABLE_ADDRESS.toHexString()}-0x2`
  );
  assert.fieldEquals(
    SUMMON_ENTITY_TYPE,
    `${summon}-0x0`,
    "endTimestamp",
    "1644659676000"
  );
  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "success", "true");
  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "status", "Finished");
  assert.fieldEquals(
    SUMMON_ENTITY_TYPE,
    `${summon}-0x0`,
    "resultToken",
    `${LEGION_ADDRESS.toHexString()}-0x1`
  );

  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "crafters", "0");
  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "summoners", "0");
  assert.fieldEquals(
    SUMMONING_CIRCLE_ENTITY_TYPE,
    "only",
    "successRate",
    "1.0"
  );
});

test("summon fatigue is tracked and cleared properly", () => {
  clearStore();

  const randomRequestEvent = createRandomRequestEvent(0, 1);

  handleRandomRequest(randomRequestEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    7
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 7, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const summoningStartedEvent = createSummoningStartedEvent(
    USER_ADDRESS,
    7,
    0,
    1643659676
  );
  handleSummoningStarted(summoningStartedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x7`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");

  const summon = `${summoningStartedEvent.address.toHexString()}-0x7`;

  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "token", id);
  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "status", "Idle");

  const newMintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(newMintEvent);

  const newLegionCreatedEvent = createLegionCreatedEvent(
    USER_ADDRESS,
    1,
    1,
    1,
    4
  );

  handleLegionCreated(newLegionCreatedEvent);

  const summoningFinishedEvent = createdSummoningFinishedEvent(
    USER_ADDRESS,
    7,
    1,
    1591808400
  );

  handleSummoningFinished(summoningFinishedEvent);

  const newId = `${LEGION_ADDRESS.toHexString()}-0x1`;

  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "status", "Finished");
  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "resultToken", newId);

  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    `${newId}-metadata`,
    "cooldown",
    "1591808400000"
  );

  assert.fieldEquals(
    SUMMON_FATIGUE_ENTITY_TYPE,
    "all",
    "data",
    `[${newId}-metadata,1591808400000]`
  );
  assert.fieldEquals(
    SUMMON_FATIGUE_ENTITY_TYPE,
    "all",
    "timestamp",
    "1591808700000"
  );

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "1");

  // Now fire a random request and should clear summon fatigue
  const anotherRandomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(anotherRandomRequestEvent);

  assert.fieldEquals(SUMMON_FATIGUE_ENTITY_TYPE, "all", "data", "[]");
  assert.fieldEquals(
    SUMMON_FATIGUE_ENTITY_TYPE,
    "all",
    "timestamp",
    "1591808700000"
  );

  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    `${newId}-metadata`,
    "cooldown",
    "null"
  );
});

test("handles when a summon fails", () => {
  clearStore();

  const randomRequestEvent = createRandomRequestEvent(0, 1);
  handleRandomRequest(randomRequestEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    7
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 7, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const summoningStartedEvent = createSummoningStartedEvent(
    USER_ADDRESS,
    7,
    0,
    1643659676
  );
  handleSummoningStarted(summoningStartedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x7`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");

  const summon = `${summoningStartedEvent.address.toHexString()}-0x7`;
  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "token", id);
  assert.fieldEquals(SUMMON_ENTITY_TYPE, summon, "status", "Idle");

  createMockedFunction(
    SUMMONING_ADDRESS,
    "didSummoningSucceed",
    "didSummoningSucceed(uint256):(bool,uint256)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(7))])
    .returns([
      ethereum.Value.fromBoolean(false),
      ethereum.Value.fromI32(1644659676),
    ]);

  const seededEvent = createRandomSeededEvent(1);

  handleRandomSeeded(seededEvent);

  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "crafters", "0");
  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "summoners", "1");
  assert.fieldEquals(
    SUMMONING_CIRCLE_ENTITY_TYPE,
    "only",
    "successRate",
    "0.5"
  );

  const summoningFinishedEvent = createdSummoningFinishedEvent(
    USER_ADDRESS,
    7,
    0,
    0
  );
  handleSummoningFinished(summoningFinishedEvent);

  assert.fieldEquals(
    SUMMON_ENTITY_TYPE,
    `${summon}-0x0`,
    "endTimestamp",
    "1644659676000"
  );
  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "success", "false");
  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "status", "Finished");

  const metadata = `${id}-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "0");

  let summonEntity = Summon.load(`${summon}-0x0`);

  if (summonEntity) {
    assert.assertNull(summonEntity.resultToken);
  } else {
    // Fail
    assert.booleanEquals(true, false);
  }

  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "crafters", "0");
  assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "summoners", "0");
  assert.fieldEquals(
    SUMMONING_CIRCLE_ENTITY_TYPE,
    "only",
    "successRate",
    "1.0"
  );
});
