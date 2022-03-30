import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Attribute, Collection, Token } from "../../generated/schema";
import { getAttributeId, getCollectionId, getTokenId } from "./ids";

export function getOrCreateAttribute(
  collection: Collection,
  token: Token,
  name: string,
  value: string,
  overrideId: string | null = null,
  skipSaveToCollection: boolean = false
): Attribute {
  const id = (overrideId || getAttributeId(collection, name, value)) as string;

  let attribute = Attribute.load(id);

  if (!attribute) {
    attribute = new Attribute(id);

    attribute.collection = collection.id;
    attribute.name = name;
    attribute.value = value;
    attribute._tokenIds = [];

    if (!skipSaveToCollection) {
      collection._attributeIds = collection._attributeIds.concat([id]);
      collection.save();
    }
  }

  const tokenIdString = token.tokenId.toString();

  if (!attribute._tokenIds.includes(tokenIdString)) {
    attribute._tokenIds = attribute._tokenIds.concat([tokenIdString]);
  }

  attribute.save();

  return attribute;
}

export function getOrCreateCollection(address: Address): Collection {
  const id = getCollectionId(address);

  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);

    collection._attributeIds = [];
    collection._missingMetadataTokens = [];
    collection.save();
  }

  return collection;
}

export function getOrCreateToken(
  collection: Collection,
  tokenId: BigInt
): Token {
  const id = getTokenId(collection, tokenId);
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);

    token.tokenId = tokenId;
    token.attributes = [];
    token.save();

    collection.tokensCount += 1;
    collection.save();
  }

  return token;
}
