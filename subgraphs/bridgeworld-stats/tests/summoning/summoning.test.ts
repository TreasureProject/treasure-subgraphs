import { assert, clearStore, test } from "matchstick-as";

import { handleLegionCreated } from "../../src/mappings/legion";
import {
  handleSummoningFinished,
  handleSummoningStarted,
} from "../../src/mappings/summoning";
import { createLegionCreatedEvent } from "../legion/utils";
import {
  createSummoningFinishedEvent,
  createSummoningStartedEvent,
} from "./utils";

const SUMMONING_STAT_ENTITY_TYPE = "SummoningStat";
const SUMMONING_LEGION_STAT_ENTITY_TYPE = "SummoningLegionStat";
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
  "all-time",
];

test("summoning stats count summons started", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const summoningStartedEvent = createSummoningStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleSummoningStarted(summoningStartedEvent);

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
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "interval",
      intervals[i]
    );
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "magicSpent",
      "300000000000000000000"
    );
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "summonsStarted",
      "1"
    );
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "1"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      SUMMONING_LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "magicSpent",
      "300000000000000000000"
    );
    assert.fieldEquals(
      SUMMONING_LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "summonsStarted",
      "1"
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const summoningStartedEvent2 = createSummoningStartedEvent(
    1642720500,
    USER_ADDRESS2,
    1
  );
  handleSummoningStarted(summoningStartedEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[0],
    "magicSpent",
    "300000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[0],
    "summonsStarted",
    "1"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[1],
    "magicSpent",
    "300000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[1],
    "summonsStarted",
    "1"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[2],
    "magicSpent",
    "300000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    statIds[2],
    "summonsStarted",
    "1"
  );

  // Assert new weekly interval was created
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "magicSpent",
    "300000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "summonsStarted",
    "1"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "activeAddressesCount",
    "1"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "202201-monthly",
    "magicSpent",
    "300000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "202201-monthly",
    "summonsStarted",
    "1"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "202201-monthly",
    "activeAddressesCount",
    "1"
  );

  // Assert yearly interval contains both deposits
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "2022-yearly",
    "magicSpent",
    "600000000000000000000"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "2022-yearly",
    "summonsStarted",
    "2"
  );
  assert.fieldEquals(
    SUMMONING_STAT_ENTITY_TYPE,
    "2022-yearly",
    "activeAddressesCount",
    "2"
  );
});

test("summoning stats count summons finished", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  const newLegionCreatedEvent = createLegionCreatedEvent(2, 1, 4);
  handleLegionCreated(newLegionCreatedEvent);

  const summoningStartedEvent = createSummoningStartedEvent(
    timestamp,
    USER_ADDRESS,
    1
  );
  handleSummoningStarted(summoningStartedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "summonsStarted",
      "1"
    );
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "1"
    );
  }

  const summoningFinishedEvent = createSummoningFinishedEvent(
    timestamp,
    USER_ADDRESS,
    1,
    2
  );
  handleSummoningFinished(summoningFinishedEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "summonsFinished",
      "1"
    );
    assert.fieldEquals(
      SUMMONING_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "0"
    );

    // Assert all time intervals for legion type are created
    assert.fieldEquals(
      SUMMONING_LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "summonsStarted",
      "1"
    );
    assert.fieldEquals(
      SUMMONING_LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-genesis-common`,
      "summonsFinished",
      "1"
    );
    assert.fieldEquals(
      SUMMONING_LEGION_STAT_ENTITY_TYPE,
      `${statIds[i]}-auxiliary-common`,
      "summonedCount",
      "1"
    );
  }
});
