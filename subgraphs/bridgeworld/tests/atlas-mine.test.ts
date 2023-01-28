import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { TREASURE_ADDRESS } from "@treasure/constants";

import {
  handleDeposit,
  handleStaked,
  handleUnstaked,
  handleWithdraw,
} from "../src/mappings/atlas-mine";
import { handleTransferBatch } from "../src/mappings/treasure";
import {
  createDepositEvent,
  createStakedEvent,
  createUnstakedEvent,
  createWithdrawEvent,
} from "./helpers/atlas-mine";
import { toBigIntString } from "./helpers/common";
import {
  ATLAS_MINE_ADDRESS,
  DEPOSIT_ENTITY_TYPE,
  Lock,
  MULTISIG_ADDRESS,
  STAKED_TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
  USER_ENTITY_TYPE,
  WITHDRAW_ENTITY_TYPE,
} from "./helpers/constants";
import { createTreasureTransferEvent } from "./helpers/treasure";

test("withdrawals will add to existing when depositId matches", () => {
  clearStore();

  const depositEvent = createDepositEvent(USER_ADDRESS, 1, 3);

  handleDeposit(depositEvent);

  const id = `${USER_ADDRESS}-0x1`;

  assert.fieldEquals(
    USER_ENTITY_TYPE,
    USER_ADDRESS,
    "deposited",
    toBigIntString(3)
  );
  assert.fieldEquals(DEPOSIT_ENTITY_TYPE, id, "amount", toBigIntString(3));
  assert.fieldEquals(DEPOSIT_ENTITY_TYPE, id, "depositId", "1");
  assert.fieldEquals(DEPOSIT_ENTITY_TYPE, id, "lock", `${Lock.TwoWeeks}`);

  const firstWithdrawEvent = createWithdrawEvent(USER_ADDRESS, 1, 1);

  handleWithdraw(firstWithdrawEvent);

  assert.fieldEquals(
    USER_ENTITY_TYPE,
    USER_ADDRESS,
    "deposited",
    toBigIntString(2)
  );
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "amount", toBigIntString(1));
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "deposit", id);
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "user", USER_ADDRESS);

  const secondWithdrawEvent = createWithdrawEvent(USER_ADDRESS, 1, 2);

  handleWithdraw(secondWithdrawEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "deposited", "0");
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "amount", toBigIntString(3));
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "deposit", id);
  assert.fieldEquals(WITHDRAW_ENTITY_TYPE, id, "user", USER_ADDRESS);
});

test("stake/unstake handles when a user does the event", () => {
  clearStore();

  const mintEvent = createTreasureTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(mintEvent);

  let transferEvent = createTreasureTransferEvent(
    USER_ADDRESS,
    ATLAS_MINE_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(transferEvent);

  const stakedEvent = createStakedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    0.157
  );

  handleStaked(stakedEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boost", "0.157");
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boosts", "1");

  const tokenId = `${TREASURE_ADDRESS.toHexString()}-0x${(95).toString(16)}`;
  const stakedId = `${USER_ADDRESS}-${tokenId}`;

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "staked", `[${stakedId}]`);
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedId,
    "mine",
    ATLAS_MINE_ADDRESS
  );
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedId, "user", USER_ADDRESS);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedId, "token", tokenId);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedId, "quantity", "1");

  transferEvent = createTreasureTransferEvent(
    ATLAS_MINE_ADDRESS,
    USER_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(transferEvent);

  const unstakedEvent = createUnstakedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    0
  );

  handleUnstaked(unstakedEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boost", "0");
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boosts", "0");

  assert.notInStore(STAKED_TOKEN_ENTITY_TYPE, stakedId);
});

test("stake/unstake handles when a multisig does the event", () => {
  clearStore();

  const mintEvent = createTreasureTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(mintEvent);

  const transferToMultisigEvent = createTreasureTransferEvent(
    USER_ADDRESS,
    MULTISIG_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(transferToMultisigEvent);

  let transferEvent = createTreasureTransferEvent(
    MULTISIG_ADDRESS,
    ATLAS_MINE_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(transferEvent);

  const stakedEvent = createStakedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    0.157,
    MULTISIG_ADDRESS
  );

  handleStaked(stakedEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, MULTISIG_ADDRESS, "boost", "0.157");
  assert.fieldEquals(USER_ENTITY_TYPE, MULTISIG_ADDRESS, "boosts", "1");
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boost", "0");
  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "boosts", "0");

  const tokenId = `${TREASURE_ADDRESS.toHexString()}-0x${(95).toString(16)}`;
  const stakedId = `${MULTISIG_ADDRESS}-${tokenId}`;

  assert.fieldEquals(
    USER_ENTITY_TYPE,
    MULTISIG_ADDRESS,
    "staked",
    `[${stakedId}]`
  );
  assert.fieldEquals(
    STAKED_TOKEN_ENTITY_TYPE,
    stakedId,
    "user",
    MULTISIG_ADDRESS
  );
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedId, "token", tokenId);
  assert.fieldEquals(STAKED_TOKEN_ENTITY_TYPE, stakedId, "quantity", "1");

  transferEvent = createTreasureTransferEvent(
    ATLAS_MINE_ADDRESS,
    MULTISIG_ADDRESS,
    [95],
    [1]
  );

  handleTransferBatch(transferEvent);

  const unstakedEvent = createUnstakedEvent(
    USER_ADDRESS,
    TREASURE_ADDRESS,
    95,
    1,
    0,
    MULTISIG_ADDRESS
  );

  handleUnstaked(unstakedEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, MULTISIG_ADDRESS, "boost", "0");
  assert.fieldEquals(USER_ENTITY_TYPE, MULTISIG_ADDRESS, "boosts", "0");

  assert.notInStore(STAKED_TOKEN_ENTITY_TYPE, stakedId);
});
