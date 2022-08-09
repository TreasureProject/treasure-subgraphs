import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { ONE_WEI } from "./constants";

export const etherToWei = (ether: f64): BigInt =>
  BigInt.fromString(
    BigDecimal.fromString(ether.toString()).times(ONE_WEI).toString()
  );

export const weiToEther = (value: BigInt): f64 =>
  parseFloat(BigDecimal.fromString(value.toString()).div(ONE_WEI).toString());
