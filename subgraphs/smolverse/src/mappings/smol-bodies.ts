import { BigInt } from "@graphprotocol/graph-ts";

import {
  BaseURIChanged,
  ERC721WithBaseUri,
  Transfer,
} from "../../generated/Smol Bodies/ERC721WithBaseUri";
import {
  MISSING_METADATA_UPDATE_INTERVAL,
  SMOL_BODIES_BASE_URI,
} from "../helpers/constants";
import { getAttributeId } from "../helpers/ids";
import { checkMissingMetadata } from "../helpers/metadata";
import { getOrCreateAttribute, getOrCreateCollection } from "../helpers/models";
import { handleTransfer as commonHandleTransfer } from "./common";

export function handleBaseUriChanged(event: BaseURIChanged): void {
  const collection = getOrCreateCollection(event.address, false);

  // Add current tokenIds to missing metadata to be reprocessed
  collection._missingMetadataTokens = collection._missingMetadataTokens.concat(
    collection._tokenIds
  );

  // Set last timestamp in the past so the reprocess of metadata starts
  collection._missingMetadataLastUpdated =
    collection._missingMetadataLastUpdated.minus(
      BigInt.fromI32(MISSING_METADATA_UPDATE_INTERVAL)
    );

  // Save new base URI
  collection.baseUri = event.params.to;
  collection.save();

  // Start metadata re-fetching
  checkMissingMetadata(collection, event.block.timestamp);
}

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address);
  if (!collection.baseUri) {
    const contract = ERC721WithBaseUri.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted
      ? SMOL_BODIES_BASE_URI
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

  // Manually create plates attribute for this swol
  if (token) {
    getOrCreateAttribute(
      collection,
      token,
      "Plates",
      "0",
      getAttributeId(collection, "Plates", token.tokenId.toHexString()),
      true
    );
  }
}
