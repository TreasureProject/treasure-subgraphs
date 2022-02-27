import { newMockEvent } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ATLAS_MINE_ADDRESS, Lock, toBigIntString } from ".";
import { Deposit, Withdraw } from "../../generated/Atlas Mine/AtlasMine";

export const createDepositEvent = (
  user: string,
  depositId: i32,
  amount: number,
  lock: i32 = Lock.TwoWeeks
): Deposit => {
  const newEvent = changetype<Deposit>(newMockEvent());
  newEvent.address = Address.fromString(ATLAS_MINE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("index", ethereum.Value.fromI32(depositId)),
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromSignedBigInt(BigInt.fromString(toBigIntString(amount)))
    ),
    new ethereum.EventParam("lock", ethereum.Value.fromI32(lock)),
  ];

  return newEvent;
};

export const createWithdrawEvent = (
  user: string,
  depositId: i32,
  amount: number
): Withdraw => {
  const newEvent = changetype<Withdraw>(newMockEvent());
  newEvent.address = Address.fromString(ATLAS_MINE_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("index", ethereum.Value.fromI32(depositId)),
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromSignedBigInt(BigInt.fromString(toBigIntString(amount)))
    ),
  ];

  return newEvent;
};
