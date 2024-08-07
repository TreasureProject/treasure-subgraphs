import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

import { Token } from "../generated/schema";
import { ONE_BD, ONE_BI, ZERO_BD, ZERO_BI } from "./const";

const TEN_BD = BigDecimal.fromString("10");

export const exponentToBigDecimal = (decimals: BigInt): BigDecimal => {
  let result = ONE_BD;
  for (let i = ZERO_BI; i.lt(decimals); i = i.plus(ONE_BI)) {
    result = result.times(TEN_BD);
  }

  return result;
};

export const amountToBigDecimal = (
  amount: BigInt,
  decimals: i32
): BigDecimal => {
  const divisor = exponentToBigDecimal(BigInt.fromI32(decimals));

  if (divisor.equals(ZERO_BD)) {
    return amount.toBigDecimal();
  }

  return amount.toBigDecimal().div(divisor);
};

export const tokenAmountToBigDecimal = (
  token: Token,
  amount: BigInt
): BigDecimal => {
  if (token.decimalDivisor.equals(ZERO_BD)) {
    return amount.toBigDecimal();
  }

  return amount.toBigDecimal().div(token.decimalDivisor);
};

export const basisPointToBigDecimal = (
  value: BigInt,
  denominator: i32 = 10000
): BigDecimal =>
  value.toBigDecimal().div(BigDecimal.fromString(denominator.toString()));
