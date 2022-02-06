import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Collection, Farm, Random, Token } from "../../generated/schema";
import { stringToSlug } from "./string";

export function getTokenId(collection: Collection, tokenId: BigInt): string {
  return [collection.id, tokenId.toHexString()].join("-");
}

export function getAttributeId(collection: Collection, name: string, value: string): string {
  return [collection.id, stringToSlug(name), stringToSlug(value)].join("-");
}

export function getFarmId(address: Address): string {
  return address.toHexString();
}

export function getStakedTokenId(token: Token, farm: Farm): string {
  return [token.id, farm.id].join("-");
}

export function getRandomId(requestId: BigInt): string {
  return requestId.toHexString();
}

export function getSeededId(commitId: BigInt): string {
  return commitId.toHexString();
}
