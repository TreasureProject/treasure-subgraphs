import { newMockEvent } from "matchstick-as";

import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { AnswerUpdated } from "../../generated/ChainlinkAggregator/ChainlinkAggregator";

export const createAnswerUpdatedEvent = (
  current: string = "150000000"
): AnswerUpdated => {
  const event = changetype<AnswerUpdated>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam(
      "current",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(current))
    ),
  ];
  return event;
};
