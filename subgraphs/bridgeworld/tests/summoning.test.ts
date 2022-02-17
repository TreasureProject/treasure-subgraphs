import { Address } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";
import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import { handleRandomRequest } from "../src/mappings/randomizer";
import {
  handleSummoningFinished,
  handleSummoningStarted,
} from "../src/mappings/summoning";
import {
  createLegionCreatedEvent,
  createLegionTransferEvent,
  createRandomRequestEvent,
  createdSummoningFinishedEvent,
  createSummoningStartedEvent,
  LEGION_INFO_ENTITY_TYPE,
  SUMMON_ENTITY_TYPE,
  SUMMON_FATIGUE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "./helpers/index";

test("summon is started and finished with result token", () => {
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

  const metadata = `${id}-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "1");

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
    0
  );
  handleSummoningFinished(summoningFinishedEvent);

  assert.fieldEquals(SUMMON_ENTITY_TYPE, `${summon}-0x0`, "status", "Finished");
  assert.fieldEquals(
    SUMMON_ENTITY_TYPE,
    `${summon}-0x0`,
    "resultToken",
    `${LEGION_ADDRESS.toHexString()}-0x1`
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

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "1");

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

  // Now fire a random request and should clear summon fatigue
  const anotherRandomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(anotherRandomRequestEvent);

  assert.notInStore(SUMMON_FATIGUE_ENTITY_TYPE, "all");

  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    `${newId}-metadata`,
    "cooldown",
    "null"
  );
});
