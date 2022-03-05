import { assert, clearStore, test } from "matchstick-as";

import {
  handleDeposit,
  handleHarvest,
  handleWithdraw,
} from "../../src/mappings/atlas-mine";
import {
  ATLAS_MINE_LOCK_STAT_ENTITY_TYPE,
  ATLAS_MINE_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ADDRESS2,
  USER_STAT_ENTITY_TYPE,
} from "../utils";
import {
  createDepositEvent,
  createHarvestEvent,
  createWithdrawEvent,
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

const STAT_ENTITY_TYPE = ATLAS_MINE_STAT_ENTITY_TYPE;

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
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "interval", intervals[i]);
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicDepositCount", "1");
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicDeposited", "500");

    // Assert all time intervals for lock period are created
    assert.fieldEquals(
      ATLAS_MINE_LOCK_STAT_ENTITY_TYPE,
      `${statIds[i]}-lock0`,
      "magicDepositCount",
      "1"
    );
    assert.fieldEquals(
      ATLAS_MINE_LOCK_STAT_ENTITY_TYPE,
      `${statIds[i]}-lock0`,
      "magicDeposited",
      "500"
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
  const depositEvent2 = createDepositEvent(1642720500, USER_ADDRESS2, 100, 1);
  handleDeposit(depositEvent2);

  // Assert previous intervals are unaffected
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[0], "magicDepositCount", "1");
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[1], "magicDepositCount", "1");
  assert.fieldEquals(STAT_ENTITY_TYPE, statIds[2], "magicDepositCount", "1");

  // Assert new weekly interval was created
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "20220116-weekly",
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "20220116-weekly",
    "magicDeposited",
    "100"
  );

  // Assert new monthly interval was created
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "202201-monthly",
    "magicDepositCount",
    "1"
  );
  assert.fieldEquals(
    STAT_ENTITY_TYPE,
    "202201-monthly",
    "magicDeposited",
    "100"
  );

  // Assert yearly interval contains both deposits
  assert.fieldEquals(STAT_ENTITY_TYPE, "2022-yearly", "magicDepositCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "2022-yearly", "magicDeposited", "600");
});

test("atlas mine stats count withrawals", () => {
  clearStore();

  const withdrawEvent = createWithdrawEvent(timestamp, USER_ADDRESS, 200);
  handleWithdraw(withdrawEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicWithdrawCount", "1");
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicWithdrawn", "200");
  }
});

test("atlas mine stats count harvests", () => {
  clearStore();

  const harvestEvent = createHarvestEvent(timestamp, USER_ADDRESS, 10);
  handleHarvest(harvestEvent);

  for (let i = 0; i < statIds.length; i++) {
    // Assert all time intervals are created
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicHarvestCount", "1");
    assert.fieldEquals(STAT_ENTITY_TYPE, statIds[i], "magicHarvested", "10");

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicHarvestCount",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicHarvested",
      "10"
    );
  }
});

test("atlas mine stats track addresses", () => {
  clearStore();

  // Two users become active
  handleDeposit(createDepositEvent(timestamp, USER_ADDRESS, 500, 0));
  handleDeposit(createDepositEvent(timestamp, USER_ADDRESS2, 500, 0));

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");

  // One user becomes inactive
  handleWithdraw(createWithdrawEvent(timestamp, USER_ADDRESS, 500));

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One active user stays active
  handleDeposit(createDepositEvent(timestamp, USER_ADDRESS2, 500, 0));

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "1");

  // One inactive user becomes active again
  handleDeposit(createDepositEvent(timestamp, USER_ADDRESS, 500, 0));

  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "allAddressesCount", "2");
  assert.fieldEquals(STAT_ENTITY_TYPE, "all-time", "activeAddressesCount", "2");
});
