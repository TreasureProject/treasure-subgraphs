import { Transfer } from "../../generated/Smol Brains Land/SmolBrainsLand";
import { SMOL_BRAINS_LAND_BASE_URI } from "../helpers/constants";
import { getOrCreateCollection } from "../helpers/models";
import { handleTransfer as commonHandleTransfer } from "./common";

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    collection.baseUri = SMOL_BRAINS_LAND_BASE_URI;
    collection.save();
  }

  commonHandleTransfer(collection, params.from, params.to, params.tokenId);
}
