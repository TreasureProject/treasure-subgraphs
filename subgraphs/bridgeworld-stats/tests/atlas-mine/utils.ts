import { newMockEvent } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import {
  Deposit,
  Harvest,
  Withdraw,
} from "../../generated/Atlas Mine/AtlasMine";

export function createDepositEvent(
  timestamp: i32,
  user: string,
  amount: i32,
  lock: i32
): Deposit {
  const event = changetype<Deposit>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("index", ethereum.Value.fromI32(0)),
    new ethereum.EventParam("amount", ethereum.Value.fromI32(amount)),
    new ethereum.EventParam("lock", ethereum.Value.fromI32(lock)),
  ];

  return event;
}

export function createWithdrawEvent(
  timestamp: i32,
  user: string,
  amount: i32
): Withdraw {
  const event = changetype<Withdraw>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("index", ethereum.Value.fromI32(0)),
    new ethereum.EventParam("amount", ethereum.Value.fromI32(amount)),
  ];

  return event;
}

export function createHarvestEvent(
  timestamp: i32,
  user: string,
  amount: i32
): Harvest {
  const event = changetype<Harvest>(newMockEvent());
  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
  event.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("index", ethereum.Value.fromI32(0)),
    new ethereum.EventParam("amount", ethereum.Value.fromI32(amount)),
  ];

  return event;
}
