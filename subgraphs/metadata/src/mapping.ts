import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { Collection, Token } from "../generated/schema";
import { MISSING_METADATA_UPDATE_INTERVAL } from "./helpers/constants";
import { getOrCreateCollection, getOrCreateToken } from "./helpers/models";

const TOKEN_REFETCH_COUNT = 100;

export class TransferEvent {
  constructor(
    public address: Address,
    public tokenId: BigInt,
    public isMint: boolean,
    public timestamp: BigInt
  ) {}
}

export function handleTransfer(
  event: TransferEvent,
  fetchTokenMetadata: (
    collection: Collection,
    token: Token,
    timestamp: BigInt
  ) => void
): void {
  const timestamp = event.timestamp;

  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, event.tokenId);

  if (event.isMint) {
    fetchTokenMetadata(collection, token, timestamp);
  }

  // Should we run missing metadata cron job?
  if (
    timestamp.gt(
      collection._missingMetadataLastUpdated.plus(
        BigInt.fromI32(MISSING_METADATA_UPDATE_INTERVAL)
      )
    )
  ) {
    const missingMetadataTokens = collection._missingMetadataTokens;

    // Reprocess max of 100 at a time.
    const tokenIds = missingMetadataTokens.slice(0, TOKEN_REFETCH_COUNT);

    log.debug("Re-fetching missing metadata from {} tokens", [
      tokenIds.length.toString(),
    ]);

    // Reset list of missing metadata before we attempt to re-fetch them
    collection._missingMetadataTokens =
      missingMetadataTokens.slice(TOKEN_REFETCH_COUNT);

    for (let index = 0; index < tokenIds.length; index++) {
      const token = Token.load(tokenIds[index]);
      if (!token) {
        log.warning("[fetch-metadata] token not found: {}", [tokenIds[index]]);
        continue;
      }

      fetchTokenMetadata(collection, token, timestamp);
    }

    // Update cron job's last run time
    collection._missingMetadataLastUpdated = timestamp;
    collection.save();
  }

  token.save();
}
