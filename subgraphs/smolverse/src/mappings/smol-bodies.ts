import {
  BaseURIChanged,
  SmolBodies,
  Transfer,
} from "../../generated/Smol Bodies/SmolBodies";
import { SMOL_BODIES_BASE_URI } from "../helpers/constants";
import { getAttributeId } from "../helpers/ids";
import { getOrCreateAttribute, getOrCreateCollection } from "../helpers/models";
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
    const contract = SmolBodies.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted
      ? SMOL_BODIES_BASE_URI
      : baseUriCall.value;
    collection.save();
  }

  const token = commonHandleTransfer(
    collection,
    params.from,
    params.to,
    params.tokenId
  );

  // Manually create plates attribute for this swol
  getOrCreateAttribute(
    collection,
    token,
    "Plates",
    "0",
    getAttributeId(collection, "Plates", token.tokenId.toHexString()),
    true
  );
}
