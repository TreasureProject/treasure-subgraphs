import { assert, clearStore, test } from "matchstick-as";

import {
  handleDeposit,
  handleHarvest,
  handleWithdraw,
} from "../../src/mappings/atlas-mine";
import {
  createDepositEvent,
  createHarvestEvent,
  createWithdrawEvent,
} from "./utils";

const ATLAS_MINE_STAT_ENTITY_TYPE = "AtlasMineStat";
const ATLAS_MIN_LOCK_STAT_ENTITY_TYPE = "AtlasMineLockStat";
const USER_ENTITY_TYPE = "User";
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

test("atlas mine stats count deposits", () => {
  clearStore();

  const depositEvent = createDepositEvent(timestamp, USER_ADDRESS, 500, 0);
  handleDeposit(depositEvent);

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
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "interval",
      intervals[i]
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicDepositCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicDeposited",
      "500"
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "activeAddressesCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "allAddressesCount",
      "1"
    );

    // Assert all time intervals for lock period are created
    assert.fieldEquals(
      ATLAS_MIN_LOCK_STAT_ENTITY_TYPE,
      `${statIds[i]}-lock0`,
      "magicDepositCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MIN_LOCK_STAT_ENTITY_TYPE,
      `${statIds[i]}-lock0`,
      "magicDeposited",
      "500"
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const depositEvent2 = createDepositEvent(1642720500, USER_ADDRESS2, 100, 1);
  handleDeposit(depositEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[0],
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[1],
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    statIds[2],
    "magicDepositCount",
    "1"
  );

  // Assert new weekly interval was created
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "magicDeposited",
    "100"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "activeAddressesCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "20220116-weekly",
    "allAddressesCount",
    "1"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "magicDeposited",
    "100"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "activeAddressesCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "allAddressesCount",
    "1"
  );

  // Assert yearly interval contains both deposits
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "magicDepositCount",
    "2"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "magicDeposited",
    "600"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "activeAddressesCount",
    "2"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "2022-yearly",
    "allAddressesCount",
    "2"
  );
});

test("atlas mine stats count withrawals", () => {
  clearStore();

  const withdrawEvent = createWithdrawEvent(timestamp, USER_ADDRESS, 200);
  handleWithdraw(withdrawEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicWithdrawCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicWithdrawn",
      "200"
    );
  }
});

test("atlas mine stats updates unique addresses on withdrawals", () => {
  clearStore();

  const depositEvent = createDepositEvent(1642720500, USER_ADDRESS, 500, 0);
  handleDeposit(depositEvent);

  const withdrawEvent = createWithdrawEvent(timestamp, USER_ADDRESS, 500);
  handleWithdraw(withdrawEvent);

  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "activeAddressesCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "202201-monthly",
    "allAddressesCount",
    "1"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "all-time",
    "activeAddressesCount",
    "0"
  );
  assert.fieldEquals(
    ATLAS_MINE_STAT_ENTITY_TYPE,
    "all-time",
    "allAddressesCount",
    "1"
  );
});

test("atlas mine stats count harvests", () => {
  clearStore();

  const harvestEvent = createHarvestEvent(timestamp, USER_ADDRESS, 10);
  handleHarvest(harvestEvent);

  // Assert user was created
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "magicHarvestCount", "1");
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "magicHarvested", "10");

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicHarvestCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MINE_STAT_ENTITY_TYPE,
      statIds[i],
      "magicHarvested",
      "10"
    );
  }
});
