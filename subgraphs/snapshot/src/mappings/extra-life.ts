import * as ERC1155 from "./1155";
import { Collection } from "../../generated/schema";
import { TransferSingle } from "../../generated/Extra Life/ERC1155";
import { isMint } from "../helpers";

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  if (isMint(params.from)) {
    let id = event.address.toHexString();
    let collection = Collection.load(id);

    if (!collection) {
      collection = new Collection(id);

      collection.name = "Extra Life";
      collection.save();
    }
  }

  ERC1155.handleTransferSingle(event);
}
