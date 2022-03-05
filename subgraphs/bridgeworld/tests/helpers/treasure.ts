import { TREASURE_ADDRESS } from "@treasure/constants";

import { TransferBatch } from "../../generated/Treasure/ERC1155";
import { createBatchTransferEvent } from "./transfer";

export const createTreasureTransferEvent = (
  from: string,
  to: string,
  ids: i32[],
  amounts: i32[]
): TransferBatch => {
  const newEvent = createBatchTransferEvent(
    TREASURE_ADDRESS,
    from,
    to,
    ids,
    amounts
  );
  newEvent.address = TREASURE_ADDRESS;

  return newEvent;
};
