import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Collection } from "../../generated/schema";

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
  return [collection.id, name.toLowerCase(), value.toLowerCase()].join("-");
}
