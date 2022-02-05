import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Attribute, Collection, Token, User } from "../../generated/schema";
import { getAttributeId, getTokenId } from "./ids";

export function getOrCreateUser(id: string): User {
  let user = User.load(id);

  if (!user) {
    user = new User(id);
  }

  return user;
}

export function getOrCreateAttribute(collection: Collection, name: string, value: string): Attribute {
  const id = getAttributeId(collection, name, value);
  let attribute = Attribute.load(id);

  if (!attribute) {
    attribute = new Attribute(id);
    attribute.collection = collection.id;
    attribute.name = name;
    attribute.value = value;
    attribute.save();
  }

  return attribute;
}

export function getOrCreateCollection(address: Address, name: string, standard: string): Collection {
  const id = address.toHexString();
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = name;
    collection.standard = standard;
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
  }

  return token;
}
