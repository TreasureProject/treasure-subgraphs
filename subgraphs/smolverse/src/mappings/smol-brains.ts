import { SmolBrains, Transfer } from "../../generated/Smol Brains/SmolBrains";
import { SMOL_BRAINS_BASE_URI } from "../helpers/constants";
import { getOrCreateCollection } from "../helpers/models";

import { handleTransfer as commonHandleTransfer } from "./common";

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;
  
  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    const contract = SmolBrains.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted ? SMOL_BRAINS_BASE_URI : baseUriCall.value;
    collection.save();
  }

  commonHandleTransfer(
    collection,
    params.from,
    params.to,
    params.tokenId
  );
}
