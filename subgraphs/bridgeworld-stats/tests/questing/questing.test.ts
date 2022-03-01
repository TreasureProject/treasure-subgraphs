import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { handleLegionCreated } from "../../src/mappings/legion";
import {
  handleQuestFinished,
  handleQuestRevealed,
  handleQuestStartedWithDifficulty,
} from "../../src/mappings/questing";
import { createLegionCreatedEvent } from "../legion/utils";
import {
  LEGION_STAT_ENTITY_TYPE,
  QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
  QUESTING_STAT_ENTITY_TYPE,
  TREASURE_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_STAT_ENTITY_TYPE,
} from "../utils";
import {
  createQuestFinishedEvent,
  createQuestRevealedEvent,
  createQuestStartedEvent,
} from "./utils";

// Feb 9 22, 7:15
const timestamp = 1644390900;
const statIds = [
  "20220209-0700-hourly",
  "20220209-daily",
  "20220206-weekly",
  "202202-monthly",
  "2022-yearly",
  "all-time",
];

test("questing stats count quests started", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const questStartedEvent = createQuestStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    0,
    2
  );
  handleQuestStartedWithDifficulty(questStartedEvent);

  const intervals = [
    "Hourly",
    "Daily",
    "Weekly",
    "Monthly",
    "Yearly",
    "AllTime",
  ];

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "interval",
      intervals[i]
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questsStarted",
      "1"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "allAddressesCount",
      "1"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "1"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questsStarted",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questsStarted",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyHard`,
      "questsStarted",
      "1"
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const questStartedEvent2 = createQuestStartedEvent(
    1642720500,
    Address.zero().toHexString(),
    1,
    0,
    0
  );
  handleQuestStartedWithDifficulty(questStartedEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[0],
    "questsStarted",
    "1"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[1],
    "questsStarted",
    "1"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    statIds[2],
    "questsStarted",
    "1"
  );

  // Assert new weekly interval was created
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "questsStarted",
    "1"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "activeAddressesCount",
    "1"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "202201-monthly",
    "questsStarted",
    "1"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "202201-monthly",
    "activeAddressesCount",
    "1"
  );

  // Assert yearly interval contains both
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "2022-yearly",
    "questsStarted",
    "2"
  );
  assert.fieldEquals(
    QUESTING_STAT_ENTITY_TYPE,
    "2022-yearly",
    "activeAddressesCount",
    "2"
  );
});

test("questing stats count consumables earned", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const questStartedEvent = createQuestStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    0,
    0
  );
  handleQuestStartedWithDifficulty(questStartedEvent);

  const questRevealedEvent = createQuestRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    3,
    3,
    1,
    0
  );
  handleQuestRevealed(questRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questingShardsEarned",
      "3"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questingStarlightEarned",
      "3"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questingUniversalLocksEarned",
      "1"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questingTreasuresEarned",
      "0"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questingShardsEarned",
      "3"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questingStarlightEarned",
      "3"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questingUniversalLocksEarned",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questingTreasuresEarned",
      "0"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questingShardsEarned",
      "3"
    );
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questingStarlightEarned",
      "3"
    );
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questingUniversalLocksEarned",
      "1"
    );
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questingTreasuresEarned",
      "0"
    );

    // Assert all time intervals for legions are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questingShardsEarned",
      "3"
    );
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questingStarlightEarned",
      "3"
    );
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questingUniversalLocksEarned",
      "1"
    );
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questingTreasuresEarned",
      "0"
    );
  }
});

test("questing stats count treasures earned", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const questStartedEvent = createQuestStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    0,
    0
  );
  handleQuestStartedWithDifficulty(questStartedEvent);

  const questRevealedEvent = createQuestRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    3,
    3,
    1,
    92
  );
  handleQuestRevealed(questRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questingTreasuresEarned",
      "1"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questingTreasuresEarned",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questingTreasuresEarned",
      "1"
    );

    // Assert all time intervals for legions are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questingTreasuresEarned",
      "1"
    );

    // Assert all time intervals for treasures are created
    assert.fieldEquals(
      TREASURE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x5c`,
      "questingEarned",
      "1"
    );
  }
});

test("questing stats count quests finished", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const questStartedEvent = createQuestStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    0,
    0
  );
  handleQuestStartedWithDifficulty(questStartedEvent);

  const questFinishedEvent = createQuestFinishedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleQuestFinished(questFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "questsFinished",
      "1"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "allAddressesCount",
      "1"
    );
    assert.fieldEquals(
      QUESTING_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "0"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "questsFinished",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "questsFinished",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      QUESTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyEasy`,
      "questsFinished",
      "1"
    );
  }
});
