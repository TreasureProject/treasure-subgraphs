import { log } from "@graphprotocol/graph-ts";

import { ORDERED_REALMS } from "./constants";

export const getRealmByIndex = (index: i32): string => {
  if (index < 0 || index > ORDERED_REALMS.length) {
    log.error("Unknown realm index: {}", [index.toString()]);
    return "Unknown";
  }

  return ORDERED_REALMS[index];
};
