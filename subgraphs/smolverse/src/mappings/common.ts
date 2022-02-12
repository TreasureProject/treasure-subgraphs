import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { StakedToken } from "../../generated/schema";
import { getCollectionId, getStakedTokenId } from "../helpers/ids";
import { getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";

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
}

export function handleUnstake(address: Address, tokenId: BigInt, location: string): void {
  const id = getStakedTokenId(
    getCollectionId(address),
    tokenId,
    location
  );
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
}

