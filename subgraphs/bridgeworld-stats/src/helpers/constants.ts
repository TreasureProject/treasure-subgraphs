import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const LEGION_GENERATIONS = [
  "Genesis",
  "Auxiliary",
  "Recruit"
];

export const LEGION_RARITIES = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "None",
];

export const ONE_WEI = BigDecimal.fromString((1e18).toString());
export const ZERO_BI = BigInt.fromI32(0);
