import { assert, clearStore, test } from "matchstick-as";

import { TREASURE_STAT_ENTITY_TYPE } from "../../../bridgeworld-stats/tests/utils";
import {
  handleFinishedUnstakingTreasure,
  handleLifeformCreated,
} from "../../src/mappings/seed-evolution";
import {
  DONKEY_TOKEN_ID,
  GLOBAL_STAT_ENTITY_TYPE,
  GOLD_COIN_TOKEN_ID,
  LIFEFORM_ENTITY_TYPE,
  toHexString,
} from "../utils";
import {
  createFinishedUnstakingTreasureEvent,
  createLifeformCreatedEvent,
} from "./utils";

test("unstaked treasures are tracked", () => {
  clearStore();

  // Create Lifeform
  handleLifeformCreated(
    createLifeformCreatedEvent(
      1,
      0,
      1,
      2,
      [GOLD_COIN_TOKEN_ID, DONKEY_TOKEN_ID],
      [6, 2]
    )
  );

  // Lifeform should tracked staked treasures
  const lifeformId = "0x1";
  assert.fieldEquals(
    LIFEFORM_ENTITY_TYPE,
    lifeformId,
    "stakedTreasureIds",
    "[92, 114]"
  );
  assert.fieldEquals(
    LIFEFORM_ENTITY_TYPE,
    lifeformId,
    "stakedTreasureAmounts",
    "[6, 2]"
  );

  // Treasure stats should track staking
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(GOLD_COIN_TOKEN_ID),
    "staked",
    "6"
  );
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(DONKEY_TOKEN_ID),
    "staked",
    "2"
  );

  // Global stats should track staking
  assert.fieldEquals(GLOBAL_STAT_ENTITY_TYPE, "only", "treasuresStaked", "8");

  // Unstake treasures
  handleFinishedUnstakingTreasure(
    createFinishedUnstakingTreasureEvent([92], [5])
  );

  // Lifeform should not have staked treasures
  assert.fieldEquals(
    LIFEFORM_ENTITY_TYPE,
    lifeformId,
    "stakedTreasureIds",
    "[]"
  );
  assert.fieldEquals(
    LIFEFORM_ENTITY_TYPE,
    lifeformId,
    "stakedTreasureAmounts",
    "[]"
  );

  // Treasure stats should track unstaking and breaking
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(GOLD_COIN_TOKEN_ID),
    "unstaked",
    "6"
  );
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(GOLD_COIN_TOKEN_ID),
    "broken",
    "1"
  );
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(DONKEY_TOKEN_ID),
    "unstaked",
    "2"
  );
  assert.fieldEquals(
    TREASURE_STAT_ENTITY_TYPE,
    toHexString(DONKEY_TOKEN_ID),
    "broken",
    "2"
  );

  // Global stats should track unstaking and breaking
  assert.fieldEquals(GLOBAL_STAT_ENTITY_TYPE, "only", "treasuresUnstaked", "8");
  assert.fieldEquals(GLOBAL_STAT_ENTITY_TYPE, "only", "treasuresBroken", "3");
});
