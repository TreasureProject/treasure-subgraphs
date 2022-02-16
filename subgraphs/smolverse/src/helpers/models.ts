import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Attribute, Collection, Random, Seeded, Token, User } from "../../generated/schema";
import { getNameForCollection } from "./collections";
import { TOKEN_STANDARD_ERC721 } from "./constants";
import { getAttributeId, getCollectionId, getRandomId, getSeededId, getTokenId } from "./ids";

export function getOrCreateUser(id: string): User {
  let user = User.load(id);

  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
}

export function getOrCreateAttribute(
  collection: Collection,
  token: Token,
  name: string,
  value: string
): Attribute {
  const id = getAttributeId(collection, name, value);
  let attribute = Attribute.load(id);

  if (!attribute) {
    attribute = new Attribute(id);
    attribute.collection = collection.id;
    attribute.name = name;
    attribute.value = value;
    attribute._tokenIds = [];

    collection._attributeIds = collection._attributeIds.concat([id]);
    collection.save();
  }

  attribute._tokenIds = attribute._tokenIds.concat([token.tokenId.toString()]);
  attribute.save();

  return attribute;
}

export function getOrCreateCollection(address: Address): Collection {
  const id = getCollectionId(address);
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = getNameForCollection(address);
    collection.standard = TOKEN_STANDARD_ERC721;
    collection._attributeIds = [];
    collection._tokenIds = [];
    collection.save();
  }

  return collection;
}

export function getOrCreateToken(collection: Collection, tokenId: BigInt): Token {
  const id = getTokenId(collection, tokenId);
  let token = Token.load(id);
  
  if (!token) {
    token = new Token(id);
    token.collection = collection.id;
    token.tokenId = tokenId;
    token.save();

    collection._tokenIds = collection._tokenIds.concat([tokenId.toString()]);
    collection.save();
  }

  return token;
}

export function getOrCreateRandom(requestId: BigInt): Random {
  const id = getRandomId(requestId);
  let random = Random.load(id);

  if (!random) {
    random = new Random(id);
    random.save();
  }

  return random;
}

export function getOrCreateSeeded(commitId: BigInt): Seeded {
  const id = getSeededId(commitId);
  let seeded = Seeded.load(id);

  if (!seeded) {
    seeded = new Seeded(id);
    seeded._randomIds = [];
    seeded.save();
  }

  return seeded;
}