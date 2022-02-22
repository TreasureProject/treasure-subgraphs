import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { ONE_WEI } from "./constants";

export function toPaddedString(number: i32): string {
  if (number < 10) {
    return `0${number}`;
  }

  return number.toString();
}

export function etherToWei(ether: i32): BigInt {
  return BigInt.fromString(
    BigDecimal.fromString(ether.toString()).times(ONE_WEI).toString()
  );
}
