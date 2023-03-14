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

export const tokenAmountToBigDecimal = (
  token: Token,
  amount: BigInt
): BigDecimal => {
  if (token.decimalDivisor.equals(ZERO_BD)) {
    return amount.toBigDecimal();
  }

  return amount.toBigDecimal().div(token.decimalDivisor);
};
