import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import {
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS
} from "@treasure/constants";

import { Collection, StakedToken, _LandMetadata } from "../../generated/schema";
import { SMOL_BRAINS_BASE_URI } from "../helpers/constants";
import { getCollectionId, getStakedTokenId } from "../helpers/ids";
import { getIpfsJson } from "../helpers/json";
import { updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";
import { isMint } from "../helpers/utils";

export function handleTransfer(
  collection: Collection,
  from: Address,
  to: Address,
  tokenId: BigInt
): void {
  const owner = getOrCreateUser(to.toHexString());
  const token = getOrCreateToken(collection, tokenId);
  token.owner = owner.id;

  if (isMint(from)) {
    const tokenIdString = tokenId.toString();
    token.name = `${collection.name} #${tokenIdString}`;

    let landMetadata: _LandMetadata | null = null;
    let tokenUri: string | null = null;
    const isLand = collection.id == getCollectionId(SMOL_BRAINS_LAND_ADDRESS);
    if (isLand) {
      // Check for cached Land metadata
      landMetadata = _LandMetadata.load("all");
      if (landMetadata) {
        token.description = landMetadata.description;
        token.image = landMetadata.image;
        token.attributes = landMetadata.attributes;
      } else {
        tokenUri = `${SMOL_BRAINS_BASE_URI}0`;
      }
    } else if (collection.baseUri && collection.baseUri != "test") { // TODO: remove hack when Matchstick supports ipfs
      const baseUri = collection.baseUri as string;
      if (
        collection.id == getCollectionId(SMOL_BRAINS_PETS_ADDRESS) ||
        collection.id == getCollectionId(SMOL_BODIES_PETS_ADDRESS)
      ) {
        tokenUri = `${baseUri}${tokenIdString}.json`;
      } else {
        tokenUri = `${baseUri}${tokenIdString}/0`;
      }
    }

    if (tokenUri) {
      const data = getIpfsJson(tokenUri);
      if (data) {
        updateTokenMetadata(token, data);
      }

      // Cache Land metadata
      if (isLand && !landMetadata) {
        landMetadata = new _LandMetadata("all");
        landMetadata.description = token.description;
        landMetadata.image = token.image;
        landMetadata.attributes = token.attributes;
        landMetadata.save();
      }
    }
  }

  token.save();
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

export function handleUnstake(address: Address, tokenId: BigInt, location: string): void {
  const collection = getOrCreateCollection(address);
  const id = getStakedTokenId(
    collection.id,
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

  collection.stakedTokensCount -= 1;
  collection.save();
}

