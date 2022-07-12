import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import {
  BaseURIChanged,
  ERC721WithBaseUri,
  Transfer,
} from "../../generated/Smol Brains Pets/ERC721WithBaseUri";
import {
  SMOL_BODIES_PETS_BASE_URI,
  SMOL_BRAINS_PETS_BASE_URI,
} from "../helpers/constants";
import { getCollectionId } from "../helpers/ids";
import { getOrCreateCollection } from "../helpers/models";
import { handleTransfer as commonHandleTransfer } from "./common";

export function handleBaseUriChanged(event: BaseURIChanged): void {
  const collection = getOrCreateCollection(event.address);
  collection.baseUri = event.params.to;
  collection.save();
}

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    const contract = ERC721WithBaseUri.bind(address);
    const baseUriCall = contract.try_baseURI();
    const defaultBaseUri =
      collection.id == getCollectionId(SMOL_BODIES_PETS_ADDRESS)
        ? SMOL_BODIES_PETS_BASE_URI
        : SMOL_BRAINS_PETS_BASE_URI;
    collection.baseUri = baseUriCall.reverted
      ? defaultBaseUri
      : baseUriCall.value;
    collection.save();
  }

  commonHandleTransfer(
    event.block.timestamp,
    collection,
    params.from,
    params.to,
    params.tokenId
  );
}
