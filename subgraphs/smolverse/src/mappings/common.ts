import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  Collection,
  StakedToken,
  Token,
  _LandMetadata,
} from "../../generated/schema";
import { MISSING_METADATA_UPDATE_INTERVAL } from "../helpers/constants";
import { getStakedTokenId } from "../helpers/ids";
import { fetchTokenMetadata } from "../helpers/metadata";
import {
  getOrCreateCollection,
  getOrCreateToken,
  getOrCreateUser,
} from "../helpers/models";
import { isMint } from "../helpers/utils";

export function handleTransfer(
  timestamp: BigInt,
  collection: Collection,
  from: Address,
  to: Address,
  tokenId: BigInt
): Token {
  const owner = getOrCreateUser(to.toHexString());
  const token = getOrCreateToken(collection, tokenId);
  token.owner = owner.id;

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
    for (let i = 0; i < tokenIds.length; i++) {
      const token = Token.load(tokenIds[i]);
      if (token) {
        fetchTokenMetadata(collection, token);
      }
    }

    // Update cron job's last run time
    collection._missingMetadataLastUpdated = timestamp;
    collection.save();
  }

  token.save();
  return token;
}

export function handleStake(
  from: Address,
  address: Address,
  tokenId: BigInt,
  location: string,
  stakeTime: BigInt | null = null
): void {
  const owner = getOrCreateUser(from.toHexString());
  const collection = getOrCreateCollection(address);
  const token = getOrCreateToken(collection, tokenId);

  const stakedTokenid = getStakedTokenId(
    collection.id,
    token.tokenId,
    location
  );
  const stakedToken = new StakedToken(stakedTokenid);
  stakedToken.token = token.id;
  stakedToken.location = location;
  stakedToken.owner = owner.id;
  stakedToken.stakeTime = stakeTime;
  stakedToken.save();

  collection.stakedTokensCount += 1;
  collection.save();
}

export function handleUnstake(
  address: Address,
  tokenId: BigInt,
  location: string
): void {
  const collection = getOrCreateCollection(address);
  const id = getStakedTokenId(collection.id, tokenId, location);
  const stakedToken = StakedToken.load(id);
  if (!stakedToken) {
    log.info("[smol-staking] Skipped already removed staked token: {}", [id]);
    return;
  }

  if (stakedToken.claims) {
    const claims = stakedToken.claims as string[];
    for (let index = 0; index < claims.length; index++) {
      store.remove("Claim", claims[index]);
    }
  }

  store.remove("StakedToken", id);

  collection.stakedTokensCount -= 1;
  collection.save();
}
