import { BigInt, log } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/Peek-A-Boo/ERC721";
import { Token } from "../generated/schema";
import { MISSING_METADATA_UPDATE_INTERVAL } from "./helpers/constants";
import { fetchTokenMetadata } from "./helpers/metadata";
import { getOrCreateCollection, getOrCreateToken } from "./helpers/models";
import { isMint } from "./helpers/utils";

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;
  const timestamp = event.block.timestamp;

  const from = params.from;
  const tokenId = params.tokenId;

  const collection = getOrCreateCollection(address);
  const token = getOrCreateToken(collection, tokenId);

  if (isMint(from)) {
    fetchTokenMetadata(collection, token);
  }

  // Should we run missing metadata cron job?
  if (
    timestamp.gt(
      collection._missingMetadataLastUpdated.plus(
        BigInt.fromI32(MISSING_METADATA_UPDATE_INTERVAL)
      )
    )
  ) {
    const tokenIds = collection._missingMetadataTokens;

    log.debug("Re-fetching missing metadata from {} tokens", [
      tokenIds.length.toString(),
    ]);

    // Reset list of missing metadata before we attempt to re-fetch them
    collection._missingMetadataTokens = [];

    for (let index = 0; index < tokenIds.length; index++) {
      const token = Token.load(tokenIds[index]);

      if (token) {
        fetchTokenMetadata(collection, token);
      }
    }

    // Update cron job's last run time
    collection._missingMetadataLastUpdated = timestamp;
    collection.save();
  }

  token.save();
}
