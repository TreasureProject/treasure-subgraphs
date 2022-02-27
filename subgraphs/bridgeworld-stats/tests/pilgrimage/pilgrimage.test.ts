import { assert, clearStore, test } from "matchstick-as/assembly/index";

import { Address } from "@graphprotocol/graph-ts";

import {
  handlePilgrimagesFinished,
  handlePilgrimagesStarted,
} from "../../src/mappings/pilgrimage";
import {
  PILGRIMAGE_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ENTITY_TYPE,
} from "../utils";
import {
  PILGRIMAGE_ADDRESS,
  createPilgrimagesFinishedEvent,
  createPilgrimagesStartedEvent,
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

test("pilgrimage stats count pilgrimages started", () => {});

test("current and total pilgrimages counts are stored", () => {
  clearStore();

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    timestamp,
    USER_ADDRESS,
    Address.zero().toHexString(),
    0,
    [1, 2, 3],
    [1, 2, 1],
    [0, 1, 2]
  );
  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  // Assert user data is updated
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "pilgrimagesStarted", "4");

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
      PILGRIMAGE_STAT_ENTITY_TYPE,
      statIds[i],
      "interval",
      intervals[i]
    );
    assert.fieldEquals(
      PILGRIMAGE_STAT_ENTITY_TYPE,
      statIds[i],
      "pilgrimagesStarted",
      "4"
    );
    assert.fieldEquals(
      PILGRIMAGE_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "1"
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const pilgrimagesStartedEvent2 = createPilgrimagesStartedEvent(
    1642720500,
    Address.zero().toHexString(),
    Address.zero().toHexString(),
    0,
    [4, 5, 6],
    [1, 1, 1],
    [3, 4, 5]
  );
  handlePilgrimagesStarted(pilgrimagesStartedEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[0],
    "pilgrimagesStarted",
    "4"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[1],
    "pilgrimagesStarted",
    "4"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    statIds[2],
    "pilgrimagesStarted",
    "4"
  );

  // Assert new weekly interval was created
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "pilgrimagesStarted",
    "3"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "activeAddressesCount",
    "1"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "pilgrimagesStarted",
    "3"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "activeAddressesCount",
    "1"
  );

  // Assert yearly interval contains both
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "pilgrimagesStarted",
    "7"
  );
  assert.fieldEquals(
    PILGRIMAGE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "activeAddressesCount",
    "2"
  );
});
