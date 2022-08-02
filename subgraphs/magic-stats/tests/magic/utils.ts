import { newMockEvent } from "matchstick-as";

import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import { Transfer } from "../../generated/Magic/ERC20";

export function createTransferEvent(
  timestamp: i32,
  from: string,
  to: string,
  amount: i32
): Transfer {
  const event = changetype<Transfer>(newMockEvent());

  event.block.number = HOURLY_STAT_INTERVAL_START_BLOCK;
  event.block.timestamp = BigInt.fromI32(timestamp);
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
      ethereum.Value.fromSignedBigInt(
        BigInt.fromI32(amount).times(
          BigInt.fromString(BigDecimal.fromString((1e18).toString()).toString())
        )
      )
    ),
  ];

  return event;
}
