import { newMockEvent } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ATLAS_MINE_ADDRESS, Lock, toBigIntString } from ".";
import {
  Deposit,
  Staked,
  Unstaked,
  Withdraw,
} from "../../generated/Atlas Mine/AtlasMine";

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

const createBoostEvent = (
  user: string,
  nft: Address,
  tokenId: i32,
  amount: i32,
  boost: number,
  to: string
): ethereum.Event => {
  const newEvent = changetype<ethereum.Event>(newMockEvent());
  newEvent.address = Address.fromString(ATLAS_MINE_ADDRESS);
  newEvent.transaction.to = Address.fromString(to);
  newEvent.transaction.from = Address.fromString(user);
  newEvent.parameters = [
    new ethereum.EventParam("nft", ethereum.Value.fromAddress(nft)),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("amount", ethereum.Value.fromI32(amount)),
    new ethereum.EventParam(
      "currentBoost",
      ethereum.Value.fromSignedBigInt(BigInt.fromString(toBigIntString(boost)))
    ),
  ];

  return newEvent;
};

export const createStakedEvent = (
  user: string,
  nft: Address,
  tokenId: i32,
  amount: i32,
  boost: number,
  to: string = ATLAS_MINE_ADDRESS
): Staked => {
  const newEvent = changetype<Staked>(
    createBoostEvent(user, nft, tokenId, amount, boost, to)
  );

  return newEvent;
};

export const createUnstakedEvent = (
  user: string,
  nft: Address,
  tokenId: i32,
  amount: i32,
  boost: number,
  to: string = ATLAS_MINE_ADDRESS
): Unstaked => {
  const newEvent = changetype<Unstaked>(
    createBoostEvent(user, nft, tokenId, amount, boost, to)
  );

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
