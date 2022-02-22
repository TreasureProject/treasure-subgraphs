import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { handleDeposit, handleWithdraw } from "../src/mappings/atlas-mine";
import { handleApproval } from "../src/mappings/magic";
import {
  ATLAS_MINE_ADDRESS,
  DEPOSIT_ENTITY_TYPE,
  Lock,
  USER_ADDRESS,
  USER_ENTITY_TYPE,
  WITHDRAW_ENTITY_TYPE,
  createApprovalEvent,
  createDepositEvent,
  createWithdrawEvent,
  toBigIntString,
} from "./helpers/index";

test("withdrawals will add to existing when depositId matches", () => {
  clearStore();

  const approvalEvent = createApprovalEvent(
    USER_ADDRESS,
    Address.fromString(ATLAS_MINE_ADDRESS)
  );

  handleApproval(approvalEvent);

  assert.fieldEquals(USER_ENTITY_TYPE, USER_ADDRESS, "deposited", "0");

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
