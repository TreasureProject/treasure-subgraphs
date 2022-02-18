import { Address } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as";

import { handleCraftingFinished, handleCraftingStartedWithDifficulty } from "../../src/mappings/crafting";
import { CRAFTING_STAT_ENTITY_TYPE, USER_ADDRESS, USER_ENTITY_TYPE } from "../utils";
import { createCraftingFinishedEvent, createCraftingStartedEvent } from "./utils";

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

test("crafting stats count crafts finished", () => {
  clearStore();

  const craftingStartedEvent = createCraftingStartedEvent(timestamp, USER_ADDRESS, 1);
  handleCraftingStartedWithDifficulty(craftingStartedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsStarted", "1");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "1");
  }

  const craftingFinishedEvent = createCraftingFinishedEvent(timestamp, USER_ADDRESS, 1);
  handleCraftingFinished(craftingFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "craftsFinished", "1");
    assert.fieldEquals(CRAFTING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "0");
  }
});
