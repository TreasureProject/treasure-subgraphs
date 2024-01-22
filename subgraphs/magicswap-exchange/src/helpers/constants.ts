import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const NULL_CALL_RESULT_VALUE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

export const ONE_BD = BigDecimal.fromString("1");
export const ONE_BI = BigInt.fromI32(1);
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString("3000");
export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString("3");
export const ZERO_BD = BigDecimal.zero();
export const ZERO_BI = BigInt.zero();
