import { BigInt, log } from "@graphprotocol/graph-ts";

import { ONE_BI, ORDERED_PATHS, ZERO_BI } from "./constants";
import { etherToWei } from "./number";

export const getPathByIndex = (index: i32): string => {
  if (index < 0 || index > ORDERED_PATHS.length) {
    log.error("Unknown path index: {}", [index.toString()]);
    return "Unknown";
  }

  return ORDERED_PATHS[index];
};

export const getMagicOfferedForPath = (index: i32): BigInt =>
  index >= 1 ? etherToWei(50) : ZERO_BI;

export const getBalancerCrystalsStakedForPath = (index: i32): BigInt =>
  index === 2 ? ONE_BI : ZERO_BI;
