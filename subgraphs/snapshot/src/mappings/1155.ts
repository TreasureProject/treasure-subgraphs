import * as common from "../mapping";
import { TransferSingle } from "../../generated/Extra Life/ERC1155";

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  common.handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value
  );
}
