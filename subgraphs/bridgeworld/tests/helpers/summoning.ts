import { newMockEvent } from "matchstick-as/assembly";

import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import { SUMMONING_ADDRESS } from "./constants";

function pad(input: i32): string {
  return `${"0".repeat(64)}${input.toString(16)}`.slice(-64);
}

export const createSummoningStartedEvent = (
  user: string,
  tokenId: i32,
  requestId: i32,
  finishTime: i32,
  tokenIdsInput: i32[] = [tokenId],
  prismIdsInput: i32[] = [0]
): SummoningStarted => {
  const newEvent = changetype<SummoningStarted>(newMockEvent());
  newEvent.address = Address.fromString(SUMMONING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("requestId", ethereum.Value.fromI32(requestId)),
    new ethereum.EventParam("finishTime", ethereum.Value.fromI32(finishTime)),
  ];

  newEvent.transaction.input = changetype<Bytes>(
    Bytes.fromHexString(
      [
        "0x10e12640",
        pad(64),
        pad(64 + 32 * (tokenIdsInput.length + 1)),
        pad(tokenIdsInput.length),
      ]
        .concat(tokenIdsInput.map<string>((input) => pad(input)))
        .concat([pad(prismIdsInput.length)])
        .concat(prismIdsInput.map<string>((input) => pad(input)))
        .join("")
    )
  );

  return newEvent;
};

export const createdSummoningFinishedEvent = (
  user: string,
  returnedId: i32,
  newTokenId: i32,
  newTokenSummoningCooldown: i32
): SummoningFinished => {
  const newEvent = changetype<SummoningFinished>(newMockEvent());
  newEvent.address = Address.fromString(SUMMONING_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "user",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("returnedId", ethereum.Value.fromI32(returnedId)),
    new ethereum.EventParam("newTokenId", ethereum.Value.fromI32(newTokenId)),
    new ethereum.EventParam(
      "summoningFatigue",
      ethereum.Value.fromI32(newTokenSummoningCooldown)
    ),
  ];

  return newEvent;
};
