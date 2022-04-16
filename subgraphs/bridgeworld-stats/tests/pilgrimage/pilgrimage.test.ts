import { assert, clearStore, test } from "matchstick-as/assembly/index";

import { Address } from "@graphprotocol/graph-ts";

import { handleLegionCreated } from "../../src/mappings/legion";
import {
  handlePilgrimagesFinished,
  handlePilgrimagesStarted,
} from "../../src/mappings/pilgrimage";
import { createLegionCreatedEvent } from "../legion/utils";
import {
  LEGION_STAT_ENTITY_TYPE,
  PILGRIMAGE_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ADDRESS2,
  USER_STAT_ENTITY_TYPE,
} from "../utils";
import {
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

const STAT_ENTITY_TYPE = PILGRIMAGE_STAT_ENTITY_TYPE;

test("pilgrimage stats count pilgrimages started", () => {
  clearStore();

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    timestamp,
    USER_ADDRESS,
    Address.zero().toHexString(),
    0,
    [1, 2, 3],
    [1, 2, 1],
    [1, 2, 3]
  );
  handlePilgrimagesStarted(pilgrimagesStartedEvent);

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
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "pilgrimagesStarted", "4");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "pilgrimagesStarted",
      "4"
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
  const pilgrimagesStartedEvent2 = createPilgrimagesStartedEvent(
    1642720500,
    Address.zero().toHexString(),
    Address.zero().toHexString(),
    0,
    [4, 5, 6],
    [1, 1, 1],
    [4, 5, 6]
  );
  handlePilgrimagesStarted(pilgrimagesStartedEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[0], "pilgrimagesStarted", "4");
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[1], "pilgrimagesStarted", "4");
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[2], "pilgrimagesStarted", "4");

  // Assert new weekly interval was created
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "20220116-weekly",
    "pilgrimagesStarted",
    "3"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "202201-monthly",
    "pilgrimagesStarted",
    "3"
  );

  // Assert yearly interval contains both
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "2022-yearly",
    "pilgrimagesStarted",
    "7"
  );
});

test("pilgrimage stats count pilgrimages finished", () => {
  clearStore();

  handleLegionCreated(createLegionCreatedEvent(1, 1, 4, 3));
  handleLegionCreated(createLegionCreatedEvent(2, 1, 4, 3));

  handlePilgrimagesStarted(
    createPilgrimagesStartedEvent(
      timestamp,
      USER_ADDRESS,
      Address.zero().toHexString(),
      0,
      [1, 2],
      [1, 1],
      [1, 2]
    )
  );

  handlePilgrimagesFinished(
    createPilgrimagesFinishedEvent(timestamp, USER_ADDRESS, [1, 2], [1, 0, 2])
  );

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      STAT_ENTITY_TYPE,
      statIds[i],
      "pilgrimagesFinished",
      "2"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "pilgrimagesFinished",
      "2"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-auxiliary-common-assassin`,
      "pilgrimagesResulted",
      "2"
    );
  }
});

test("pilgrimage stats track addresses", () => {
  clearStore();

  handleLegionCreated(createLegionCreatedEvent(1, 1, 4, 3));
  handleLegionCreated(createLegionCreatedEvent(2, 1, 4, 3));
  handleLegionCreated(createLegionCreatedEvent(3, 1, 4, 3));

  // Two users become active
  handlePilgrimagesStarted(
    createPilgrimagesStartedEvent(
      timestamp,
      USER_ADDRESS,
      Address.zero().toHexString(),
      0,
      [1],
      [1],
      [1]
    )
  );
  handlePilgrimagesStarted(
    createPilgrimagesStartedEvent(
      timestamp,
      USER_ADDRESS2,
      Address.zero().toHexString(),
      0,
      [2],
      [1],
      [2]
    )
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");

  // One user becomes inactive
  handlePilgrimagesFinished(
    createPilgrimagesFinishedEvent(timestamp, USER_ADDRESS, [1], [1])
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One active user stays active
  handlePilgrimagesStarted(
    createPilgrimagesStartedEvent(
      timestamp,
      USER_ADDRESS2,
      Address.zero().toHexString(),
      0,
      [3],
      [1],
      [3]
    )
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One inactive user becomes active again
  handlePilgrimagesStarted(
    createPilgrimagesStartedEvent(
      timestamp,
      USER_ADDRESS,
      Address.zero().toHexString(),
      0,
      [1],
      [1],
      [4]
    )
  );

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");
});
