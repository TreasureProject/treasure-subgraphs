import {
  ERC721WithBaseUri,
  Transfer,
} from "../../generated/Smol Brains/ERC721WithBaseUri";
import { SMOL_BRAINS_BASE_URI } from "../helpers/constants";
import { getAttributeId } from "../helpers/ids";
import { getOrCreateAttribute, getOrCreateCollection } from "../helpers/models";
import { handleTransfer as commonHandleTransfer } from "./common";

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    const contract = ERC721WithBaseUri.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted
      ? SMOL_BRAINS_BASE_URI
      : baseUriCall.value;
    collection.save();
  }

  const token = commonHandleTransfer(
    event.block.timestamp,
    collection,
    params.from,
    params.to,
    params.tokenId
  );

  // Manually create IQ attribute for this smol
  if (token) {
    getOrCreateAttribute(
      collection,
      token,
      "IQ",
      "0",
      getAttributeId(collection, "IQ", token.tokenId.toHexString()),
      true
    );
  }
}
