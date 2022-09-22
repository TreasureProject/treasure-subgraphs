import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  Collection,
  StakedToken,
  Token,
  _LandMetadata,
} from "../../generated/schema";
import { getStakedTokenId } from "../helpers/ids";
import { checkMissingMetadata, fetchTokenMetadata } from "../helpers/metadata";
import {
  getOrCreateCollection,
  getOrCreateToken,
  getOrCreateUser,
  removeToken,
} from "../helpers/models";
import { isZero } from "../helpers/utils";

export function handleTransfer(
  timestamp: BigInt,
  collection: Collection,
  from: Address,
  to: Address,
  tokenId: BigInt
): Token | null {
  if (isZero(to)) {
    // Burn
    removeToken(collection, tokenId);
    return null;
  }

  const owner = getOrCreateUser(to.toHexString());
  const token = getOrCreateToken(collection, tokenId);
  token.owner = owner.id;

  if (isZero(from)) {
    // Mint
    fetchTokenMetadata(collection, token);

    collection._tokenIds = collection._tokenIds.concat([token.id]);
    collection.save();
  }

  checkMissingMetadata(collection, timestamp);

  token.save();
  return token;
}

export function handleStake(
  from: Address,
  address: Address,
  tokenId: BigInt,
  location: string,
  stakeTime: BigInt | null = null
): StakedToken {
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

  return stakedToken;
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
