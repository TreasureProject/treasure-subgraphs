import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Claim, Collection, Token } from "../../generated/schema";
import { stringToSlug } from "./string";

export function getCollectionId(address: Address): string {
  return address.toHexString();
}

export function getTokenId(collection: Collection, tokenId: BigInt): string {
  return [collection.id, tokenId.toHexString()].join("-");
}

export function getAttributeId(
  collection: Collection,
  name: string,
  value: string
): string {
  return [collection.id, stringToSlug(name), stringToSlug(value)].join("-");
}

export function getStakedTokenId(
  collectionId: string,
  tokenId: BigInt,
  location: string
): string {
  return [collectionId, tokenId.toHexString(), location.toLowerCase()].join(
    "-"
  );
}

export function getRandomId(requestId: BigInt): string {
  return requestId.toHexString();
}

export function getSeededId(commitId: BigInt): string {
  return commitId.toHexString();
}

export function getRewardId(claim: Claim): string {
  return `${claim.id}-${BigInt.fromI32(
    claim.rewards.length + 1
  ).toHexString()}`;
}
