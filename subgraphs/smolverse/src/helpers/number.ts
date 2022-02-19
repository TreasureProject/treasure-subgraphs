import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function toBigDecimal(value: number): BigDecimal {
  return BigDecimal.fromString(value.toString());
}

const ONE_WEI = BigDecimal.fromString((1e18).toString());

export function weiToEther(value: BigInt): f64 {
  return parseFloat(BigDecimal.fromString(value.toString()).div(ONE_WEI).toString());
}
