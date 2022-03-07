import { ethereum } from "@graphprotocol/graph-ts";

import {
  MARKETPLACE_ADDRESS,
  TREASURE_MARKETPLACE_PAUSE_START_BLOCK,
} from "@treasure/constants";

export function isPaused(event: ethereum.Event): boolean {
  return (
    event.block.number.gt(TREASURE_MARKETPLACE_PAUSE_START_BLOCK) &&
    event.address.equals(MARKETPLACE_ADDRESS)
  );
}
