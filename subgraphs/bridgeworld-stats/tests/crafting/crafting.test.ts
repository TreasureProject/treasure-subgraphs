import { Address } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as";

import { ZERO_BI } from "../../src/helpers/constants";
import { etherToWei } from "../../src/helpers/number";
import {
  handleCraftingFinished,
  handleCraftingRevealed,
  handleCraftingStartedWithDifficulty
} from "../../src/mappings/crafting";
import { handleLegionCreated } from "../../src/mappings/legion";
import { createLegionCreatedEvent } from "../legion/utils";
import {
  CRAFTING_STAT_ENTITY_TYPE,
  LEGION_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ENTITY_TYPE
} from "../utils";
import {
  createCraftingFinishedEvent,
  createCraftingRevealedEvent,
  createCraftingStartedEvent
} from "./utils";

// Feb 9 22, 7:15
const timestamp = 1644390900;
const statIds = [
  "20220209-0700-hourly",
  "20220209-daily",
  "20220206-weekly",
  "202202-monthly",
  "2022-yearly",
  "all-time"
];

test("crafting stats count crafts started", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(timestamp, USER_ADDRESS, 1);
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  // Assert user data is updated
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "craftsStarted", "1");

  const intervals = [
    "Hourly",
    "Daily",
    "Weekly",
    "Monthly",
    "Yearly",
    "AllTime"
  ];
  
  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "interval", intervals[i]);
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsStarted", "1");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "1");

    // Assert all time intervals for legion type are created
    assert.fieldEquals(LEGION_STAT_ENTITY_TYPE, `${statIds[i]}-genesis-common`, "craftsStarted", "1");
  }

  // Assert start and end times are correct
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[0], "startTimestamp", "1644390000");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[0], "endTimestamp", "1644393599");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[1], "startTimestamp", "1644364800");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[1], "endTimestamp", "1644451199");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[2], "startTimestamp", "1644105600");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[2], "endTimestamp", "1644710399");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[3], "startTimestamp", "1643673600");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[3], "endTimestamp", "1646092799");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[4], "startTimestamp", "1640995200");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[4], "endTimestamp", "1672531199");
  
  // Jan 20 22, 23:15
  const craftinggStartedEvent2 = createCraftingStartedEvent(1642720500, Address.zero().toHexString(), 1);
  handleCraftingStartedWithDifficulty(craftinggStartedEvent2);
  
  // Assert previous intervals are unaffected
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[0], "craftsStarted", "1");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[1], "craftsStarted", "1");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[2], "craftsStarted", "1");

  // Assert new weekly interval was created
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "20220116-weekly", "craftsStarted", "1");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "20220116-weekly", "activeAddressesCount", "1");

  // Assert new monthly interval was created
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "202201-monthly", "craftsStarted", "1");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "202201-monthly", "activeAddressesCount", "1");

  // Assert yearly interval contains both
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "2022-yearly", "craftsStarted", "2");
  assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, "2022-yearly", "activeAddressesCount", "2");
});

test("crafting stats count magic consumed", () => {
  clearStore();

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    true
  );
  handleCraftingRevealed(craftingRevealedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "magicConsumed", "5000000000000000000");
  }
});

test("crafting stats count magic returned", () => {
  clearStore();

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
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "magicConsumed", "500000000000000000");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "magicReturned", "4500000000000000000");
  }
});

test("crafting stats count crafts succeeded", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(timestamp, USER_ADDRESS, 1, true);
  handleCraftingRevealed(craftingRevealedEvent);

  // Assert user data is updated
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "craftsSucceeded", "1");

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsSucceeded", "1");

    // Assert all time intervals for legion type are created
    assert.fieldEquals(LEGION_STAT_ENTITY_TYPE, `${statIds[i]}-genesis-common`, "craftsSucceeded", "1");
  }
});

test("crafting stats count crafts failed", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingRevealedEvent = createCraftingRevealedEvent(timestamp, USER_ADDRESS, 1, false);
  handleCraftingRevealed(craftingRevealedEvent);

  // Assert user data is updated
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "craftsFailed", "1");

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsFailed", "1");

    // Assert all time intervals for legion type are created
    assert.fieldEquals(LEGION_STAT_ENTITY_TYPE, `${statIds[i]}-genesis-common`, "craftsFailed", "1");
  }
});

test("crafting stats count broken treasures", () => {
  clearStore();

  const craftingRevealedEvent = createCraftingRevealedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    true,
    ZERO_BI,
    0,
    [1, 2],
    [1, 1]
  );
  handleCraftingRevealed(craftingRevealedEvent);

  // Assert user data is updated
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "brokenTreasuresCount", "2");

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "brokenTreasuresCount", "2");
  }
});

test("crafting stats count crafts finished", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const craftingStartedEvent = createCraftingStartedEvent(timestamp, USER_ADDRESS, 1);
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsStarted", "1");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "1");

    // Assert all time intervals for legion type are created
    assert.fieldEquals(LEGION_STAT_ENTITY_TYPE, `${statIds[i]}-genesis-common`, "craftsStarted", "1");
  }

  const craftingFinishedEvent = createCraftingFinishedEvent(timestamp, USER_ADDRESS, 1);
  handleCraftingFinished(craftingFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsFinished", "1");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "0");

    // Assert all time intervals for legion type are created
    assert.fieldEquals(LEGION_STAT_ENTITY_TYPE, `${statIds[i]}-genesis-common`, "craftsFinished", "1");
  }
});
