import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);

export function toBigDecimal(value: number): BigDecimal {
  return BigDecimal.fromString(value.toString());
}
