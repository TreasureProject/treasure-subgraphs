import {
  assert,
  beforeEach,
  clearStore,
  describe,
  log,
  test,
} from "matchstick-as";

import { Address, Bytes } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import {
  handleSummoningFinished,
  handleSummoningStarted,
} from "../src/mappings/summoning";
import {
  LEGION_INFO_ENTITY_TYPE,
  SUMMON_ENTITY_TYPE,
  USER_ADDRESS,
} from "./helpers/constants";
import {
  createLegionCreatedEvent,
  createLegionTransferEvent,
} from "./helpers/legion";
import {
  createSummoningStartedEvent,
  createdSummoningFinishedEvent,
} from "./helpers/summoning";

describe("summoning", () => {
  const TOKEN_ID = 1;

  beforeEach(() => {
    clearStore();

    // Create Legion
    handleTransfer(
      createLegionTransferEvent(
        Address.zero().toHexString(),
        USER_ADDRESS,
        TOKEN_ID
      )
    );
    handleLegionCreated(
      createLegionCreatedEvent(USER_ADDRESS, TOKEN_ID, 0, 6, 2)
    );
  });

  test("that summoning is started and finished", () => {
    handleSummoningStarted(
      createSummoningStartedEvent(USER_ADDRESS, TOKEN_ID, 1, 0)
    );

    const summonId = Bytes.fromI32(TOKEN_ID).toHexString();
    const legionId = `${LEGION_ADDRESS.toHexString()}-0x${TOKEN_ID.toString(
      16
    )}`;

    // Assert relevant fields are set for started summon
    assert.fieldEquals(SUMMON_ENTITY_TYPE, summonId, "user", USER_ADDRESS);
    assert.fieldEquals(SUMMON_ENTITY_TYPE, summonId, "token", legionId);
    assert.fieldEquals(SUMMON_ENTITY_TYPE, summonId, "status", "Revealable");

    handleSummoningFinished(
      createdSummoningFinishedEvent(USER_ADDRESS, TOKEN_ID, 2, 0)
    );

    // Assert summon count is added to Legion
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      `${legionId}-metadata`,
      "summons",
      "1"
    );

    // Assert completed summon has been deleted
    assert.notInStore(SUMMON_ENTITY_TYPE, summonId);
  });
});
