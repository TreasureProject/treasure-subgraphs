import { BigDecimal } from "@graphprotocol/graph-ts";

export function toBigDecimal(value: number): BigDecimal {
  return BigDecimal.fromString(value.toString());
}
