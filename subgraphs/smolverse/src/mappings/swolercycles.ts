import { BigInt } from "@graphprotocol/graph-ts";

import {
  BaseURIChanged,
  ERC721WithBaseUri,
  Transfer,
} from "../../generated/Swolercycles/ERC721WithBaseUri";
import {
  MISSING_METADATA_UPDATE_INTERVAL,
  SWOLERCYCLES_BASE_URI,
} from "../helpers/constants";
import { checkMissingMetadata } from "../helpers/metadata";
import { getOrCreateCollection } from "../helpers/models";
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
  collection.baseUri = event.params.to;
  collection.save();

  checkMissingMetadata(collection, event.block.timestamp);
}

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;

  const collection = getOrCreateCollection(address, false);
  if (!collection.baseUri) {
    const contract = ERC721WithBaseUri.bind(address);
    const baseUriCall = contract.try_baseURI();
    collection.baseUri = baseUriCall.reverted
      ? SWOLERCYCLES_BASE_URI
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
