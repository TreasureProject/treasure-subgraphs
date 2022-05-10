import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { handleTransfer } from "../../src/mapping";
import {
  MAGIC_STAT_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ADDRESS2,
  USER_STAT_ENTITY_TYPE,
  ZERO_ADDRESS,
} from "../utils";
import { createTransferEvent } from "./utils";

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

const magicBi = "100000000000000000000";
const magicBi2 = "2".concat(magicBi.slice(1));

test("magic stats count transfers", () => {
  clearStore();

  const transferEvent = createTransferEvent(
    timestamp,
    USER_ADDRESS,
    USER_ADDRESS2,
    100
  );
  handleTransfer(transferEvent);

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
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "interval",
      intervals[i]
    );
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "magicTransfered",
      magicBi
    );
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "magicTransferedCount",
      "1"
    );
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "allAddressesCount",
      "2"
    );

    // Assert all time intervals for user are created
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicSentCount",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicSent",
      magicBi
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicReceivedCount",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicReceived",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicSentCount",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicSent",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicReceivedCount",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicReceived",
      magicBi
    );
  }

  // Assert start and end times are correct
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[0],
    "startTimestamp",
    "1644390000"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[0],
    "endTimestamp",
    "1644393599"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[1],
    "startTimestamp",
    "1644364800"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[1],
    "endTimestamp",
    "1644451199"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[2],
    "startTimestamp",
    "1644105600"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[2],
    "endTimestamp",
    "1644710399"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[3],
    "startTimestamp",
    "1643673600"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[3],
    "endTimestamp",
    "1646092799"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[4],
    "startTimestamp",
    "1640995200"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statIds[4],
    "endTimestamp",
    "1672531199"
  );

  // Jan 20 22, 23:15
  const transferEvent2 = createTransferEvent(
    1642720500,
    Address.zero().toHexString(),
    USER_ADDRESS,
    100
  );
  handleTransfer(transferEvent2);

  // Assert previous intervals are unaffected
  for (let i = 0; i < 3; i++) {
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "magicTransfered",
      magicBi
    );
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "magicTransferedCount",
      "1"
    );
    assert.fieldEquals(
      MAGIC_STAT_ENTITY_TYPE,
      statIds[i],
      "allAddressesCount",
      "2"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicSentCount",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicSent",
      magicBi
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicReceivedCount",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS}`,
      "magicReceived",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicSentCount",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicSent",
      "0"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicReceivedCount",
      "1"
    );
    assert.fieldEquals(
      USER_STAT_ENTITY_TYPE,
      `${statIds[i]}-${USER_ADDRESS2}`,
      "magicReceived",
      magicBi
    );
  }

  // Assert new weekly interval was created
  let statPrefix = "20220116-weekly";

  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransfered",
    magicBi
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransferedCount",
    "1"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "allAddressesCount",
    "2"
  );

  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSentCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSent",
    magicBi
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceivedCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceived",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSentCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSent",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceivedCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceived",
    magicBi
  );

  // Assert new monthly interval was created
  statPrefix = "202201-monthly";

  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransfered",
    magicBi
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransferedCount",
    "1"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "allAddressesCount",
    "2"
  );

  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSentCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSent",
    magicBi
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceivedCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceived",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSentCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSent",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceivedCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceived",
    magicBi
  );

  // Assert yearly interval contains both
  statPrefix = "2022-yearly";

  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransfered",
    magicBi2
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "magicTransferedCount",
    "2"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    statPrefix,
    "allAddressesCount",
    "3"
  );

  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSentCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicSent",
    magicBi
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceivedCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${ZERO_ADDRESS}`,
    "magicReceived",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSentCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicSent",
    magicBi
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceivedCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS}`,
    "magicReceived",
    magicBi
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS2}`,
    "magicSentCount",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS2}`,
    "magicSent",
    "0"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS2}`,
    "magicReceivedCount",
    "1"
  );
  assert.fieldEquals(
    USER_STAT_ENTITY_TYPE,
    `${statPrefix}-${USER_ADDRESS2}`,
    "magicReceived",
    magicBi
  );
});

test("magic stats track addresses", () => {
  clearStore();

  // Handles transfer betweeen 2 users
  handleTransfer(
    createTransferEvent(timestamp, USER_ADDRESS, USER_ADDRESS2, 100)
  );

  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "allAddressesCount",
    "2"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "magicTransferedCount",
    "1"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "magicTransfered",
    magicBi
  );

  // One user becomes inactive
  handleTransfer(
    createTransferEvent(timestamp, USER_ADDRESS, ZERO_ADDRESS, 100)
  );

  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "allAddressesCount",
    "3"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "magicTransferedCount",
    "2"
  );
  assert.fieldEquals(
    MAGIC_STAT_ENTITY_TYPE,
    "all-time",
    "magicTransfered",
    magicBi2
  );
});
