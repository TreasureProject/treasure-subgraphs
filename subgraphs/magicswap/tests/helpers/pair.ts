import { newMockEvent } from "matchstick-as";

import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { PairCreated } from "../../generated/UniswapV2Factory/UniswapV2Factory";
import {
  Burn,
  Mint,
  Sync,
  Transfer,
} from "../../generated/templates/UniswapV2Pair/UniswapV2Pair";
import { PAIR, TOKEN0, TOKEN1, TX_HASH1 } from "../helpers/constants";

export const createPairCreatedEvent = (
  token0: string = TOKEN0,
  token1: string = TOKEN1,
  pair: string = PAIR
): PairCreated => {
  const event = changetype<PairCreated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "token0",
      ethereum.Value.fromAddress(Address.fromString(token0))
    ),
    new ethereum.EventParam(
      "token1",
      ethereum.Value.fromAddress(Address.fromString(token1))
    ),
    new ethereum.EventParam(
      "pair",
      ethereum.Value.fromAddress(Address.fromString(pair))
    ),
    new ethereum.EventParam("param3", ethereum.Value.fromI32(0)),
  ];

  return event;
};

export const createSyncEvent = (
  pair: string,
  reserve0: string,
  reserve1: string
): Sync => {
  const event = changetype<Sync>(newMockEvent());
  event.address = Address.fromString(pair);
  event.parameters = [
    new ethereum.EventParam(
      "reserve0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(reserve0))
    ),
    new ethereum.EventParam(
      "reserve1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(reserve1))
    ),
  ];
  return event;
};

export const createTransferEvent = (
  pair: string,
  from: string,
  to: string,
  value: string,
  hash: string = TX_HASH1
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = Address.fromString(pair);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam(
      "value",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
    ),
  ];
  return event;
};

export const createMintEvent = (
  pair: string,
  sender: string,
  amount0: string,
  amount1: string,
  hash: string = TX_HASH1
): Mint => {
  const event = changetype<Mint>(newMockEvent());
  event.address = Address.fromString(pair);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.transaction.from = Address.fromString(sender);
  event.parameters = [
    new ethereum.EventParam(
      "sender",
      ethereum.Value.fromAddress(Address.fromString(sender))
    ),
    new ethereum.EventParam(
      "amount0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount0))
    ),
    new ethereum.EventParam(
      "amount1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount1))
    ),
  ];
  return event;
};

export const createBurnEvent = (
  pair: string,
  sender: string,
  amount0: string,
  amount1: string,
  to: string,
  hash: string = TX_HASH1
): Burn => {
  const event = changetype<Burn>(newMockEvent());
  event.address = Address.fromString(pair);
  event.transaction.hash = Bytes.fromHexString(hash);
  event.transaction.from = Address.fromString(sender);
  event.parameters = [
    new ethereum.EventParam(
      "sender",
      ethereum.Value.fromAddress(Address.fromString(sender))
    ),
    new ethereum.EventParam(
      "amount0",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount0))
    ),
    new ethereum.EventParam(
      "amount1",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(amount1))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
  ];
  return event;
};
