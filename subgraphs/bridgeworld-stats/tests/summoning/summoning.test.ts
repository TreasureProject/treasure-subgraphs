import { assert, clearStore, test } from "matchstick-as";

import { handleSummoningFinished, handleSummoningStarted } from "../../src/mappings/summoning";
import { createSummoningFinishedEvent, createSummoningStartedEvent } from "./utils";

const SUMMONING_STAT_ENTITY_TYPE = "SummoningStat";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";
const USER_ADDRESS2 = "0x461950b159366edcd2bcbee8126d973ac49238e1";

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

test("summoning stats count summons started", () => {
  clearStore();

  const summoningStartedEvent = createSummoningStartedEvent(timestamp, USER_ADDRESS);
  handleSummoningStarted(summoningStartedEvent);

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
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "interval", intervals[i]);
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "summonsStarted", "1");
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "1");
  }

  // Assert start and end times are correct
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[0], "startTimestamp", "1644390000");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[0], "endTimestamp", "1644393599");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[1], "startTimestamp", "1644364800");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[1], "endTimestamp", "1644451199");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[2], "startTimestamp", "1644105600");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[2], "endTimestamp", "1644710399");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[3], "startTimestamp", "1643673600");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[3], "endTimestamp", "1646092799");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[4], "startTimestamp", "1640995200");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[4], "endTimestamp", "1672531199");
  
  // Jan 20 22, 23:15
  const summoningStartedEvent2 = createSummoningStartedEvent(1642720500, USER_ADDRESS2);
  handleSummoningStarted(summoningStartedEvent2);
  
  // Assert previous intervals are unaffected
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[0], "summonsStarted", "1");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[1], "summonsStarted", "1");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[2], "summonsStarted", "1");

  // Assert new weekly interval was created
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "20220116-weekly", "summonsStarted", "1");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "20220116-weekly", "activeAddressesCount", "1");

  // Assert new monthly interval was created
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "202201-monthly", "summonsStarted", "1");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "202201-monthly", "activeAddressesCount", "1");

  // Assert yearly interval contains both deposits
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "2022-yearly", "summonsStarted", "2");
  assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, "2022-yearly", "activeAddressesCount", "2");
});

test("summoning stats count summons finished", () => {
  clearStore();

  const summoningStartedEvent = createSummoningStartedEvent(timestamp, USER_ADDRESS);
  handleSummoningStarted(summoningStartedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "summonsStarted", "1");
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "1");
  }

  const summoningFinishedEvent = createSummoningFinishedEvent(timestamp, USER_ADDRESS);
  handleSummoningFinished(summoningFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "summonsFinished", "1");
    assert.fieldEquals(SUMMONING_STAT_ENTITY_TYPE, statIds[i], "activeAddressesCount", "0");
  }
});
