import { assert, clearStore, test } from "matchstick-as";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { etherToWei } from "../../src/helpers/number";
import {
  handleCraftingFinished,
  handleCraftingRevealed,
  handleCraftingStartedWithDifficulty,
} from "../../src/mappings/crafting";
import { handleLegionCreated } from "../../src/mappings/legion";
import { createLegionCreatedEvent } from "../legion/utils";
import {
  CONSUMABLE_STAT_ENTITY_TYPE,
  CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
  CRAFTING_STAT_ENTITY_TYPE,
  LEGION_STAT_ENTITY_TYPE,
  TREASURE_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ADDRESS2,
  USER_STAT_ENTITY_TYPE,
} from "../utils";
import {
  createCraftingFinishedEvent,
  createCraftingRevealedEvent,
  createCraftingStartedEvent,
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

const STAT_ENTITY_TYPE = CRAFTING_STAT_ENTITY_TYPE;

test("crafting stats count crafts started", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    0,
    2
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

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
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "interval", intervals[i]);
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "craftsStarted", "1");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "craftsStarted",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "craftsStarted",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyExtractor`,
      "craftsStarted",
      "1"
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const craftingStartedEvent2 = createCraftingStartedEvent(
    1642720500,
    Address.zero().toHexString(),
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[0], "craftsStarted", "1");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statIds[0]}-${USER_ADDRESS}`,
    "craftsStarted",
    "1"
  );
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[1], "craftsStarted", "1");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statIds[1]}-${USER_ADDRESS}`,
    "craftsStarted",
    "1"
  );
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[2], "craftsStarted", "1");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statIds[2]}-${USER_ADDRESS}`,
    "craftsStarted",
    "1"
  );

  // Assert new weekly interval was created
  assert.fieldEquals(STAT_ENTITY_TYPE, "20220116-weekly", "craftsStarted", "1");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `20220116-weekly-${Address.zero().toHexString()}`,
    "craftsStarted",
    "1"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(STAT_ENTITY_TYPE, "202201-monthly", "craftsStarted", "1");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `202201-monthly-${Address.zero().toHexString()}`,
    "craftsStarted",
    "1"
  );

  // Assert yearly interval contains both
  assert.fieldEquals(STAT_ENTITY_TYPE, "2022-yearly", "craftsStarted", "2");
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `2022-yearly-${USER_ADDRESS}`,
    "craftsStarted",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `2022-yearly-${Address.zero().toHexString()}`,
    "craftsStarted",
    "1"
  );
});

test("crafting stats count magic consumed", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    true
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      STAT_ENTITY_TYPE,
      statIds[i],
      "magicConsumed",
      "5000000000000000000"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "magicConsumed",
      "5000000000000000000"
    );
  }
});

test("crafting stats count magic returned", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    false,
    etherToWei(4.5)
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      STAT_ENTITY_TYPE,
      statIds[i],
      "magicConsumed",
      "500000000000000000"
    );
    assert.fieldEquals(
      STAT_ENTITY_TYPE,
      statIds[i],
      "magicReturned",
      "4500000000000000000"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "magicConsumed",
      "500000000000000000"
    );
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "magicReturned",
      "4500000000000000000"
    );
  }
});

test("crafting stats count treasures used", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    1,
    0,
    [92],
    [2]
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    false
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      TREASURE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x5c`,
      "craftingUsed",
      "2"
    );
  }
});

test("crafting stats count crafts succeeded", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    true
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "craftsSucceeded", "1");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "craftsSucceeded",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "craftsSucceeded",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "craftsSucceeded",
      "1"
    );
  }
});

test("crafting stats count crafts failed", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    false
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "craftsFailed", "1");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "craftsFailed",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "craftsFailed",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "craftsFailed",
      "1"
    );
  }
});

test("crafting stats count broken treasures", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    true,
    BigInt.zero(),
    3,
    [92, 96],
    [2, 1]
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      STAT_ENTITY_TYPE,
      statIds[i],
      "brokenTreasuresCount",
      "3"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "brokenTreasuresCount",
      "3"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "brokenTreasuresCount",
      "3"
    );

    // Assert all time intervals for consumable are created
    assert.fieldEquals(
      CONSUMABLE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x3`,
      "name",
      "Large Prism"
    );
    assert.fieldEquals(
      CONSUMABLE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x3`,
      "craftingEarned",
      "1"
    );

    // Assert all time intervals for treasure are created
    assert.fieldEquals(
      TREASURE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x5c`,
      "craftingBroken",
      "2"
    );
    assert.fieldEquals(
      TREASURE_STAT_ENTITY_TYPE,
      `${statIds[i]}-0x60`,
      "craftingBroken",
      "1"
    );
  }
});

test("crafting stats count crafts finished", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  const craftingFinishedEvent = createCraftingFinishedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleCraftingFinished(craftingFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "craftsFinished", "1");
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "allAddressesCount", "1");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "craftsFinished",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "craftsFinished",
      "1"
    );

    // Assert all time intervals for difficulty are created
    assert.fieldEquals(
      CRAFTING_DIFFICULTY_STAT_ENTITY_TYPE,
      `${statIds[i]}-difficultyPrism`,
      "craftsFinished",
      "1"
    );
  }
});

test("crafing stats track addresses", () => {
  clearStore();

  handleLegionCreated(createLegionCreatedEvent(1, 1, 4, 3));
  handleLegionCreated(createLegionCreatedEvent(2, 1, 4, 3));
  handleLegionCreated(createLegionCreatedEvent(3, 1, 4, 3));

  // Two users become active
  handleCraftingStartedWithDifficulty(
    createCraftingStartedEvent(timestamp, USER_ADDRESS, 1, 0, 2)
  );
  handleCraftingStartedWithDifficulty(
    createCraftingStartedEvent(timestamp, USER_ADDRESS2, 2, 0, 2)
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");

  // One user becomes inactive
  handleCraftingFinished(
    createCraftingFinishedEvent(timestamp, USER_ADDRESS, 1)
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One active user stays active
  handleCraftingStartedWithDifficulty(
    createCraftingStartedEvent(timestamp, USER_ADDRESS2, 3, 0, 2)
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One inactive user becomes active again
  handleCraftingStartedWithDifficulty(
    createCraftingStartedEvent(timestamp, USER_ADDRESS, 1, 0, 2)
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");
});
