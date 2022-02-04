import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import { Attribute, Collection, SmolBodiesPet, User } from "../../generated/schema";
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

export function getOrCreateSmolBodiesCollection(): Collection {
  const id = SMOL_BODIES_PETS_ADDRESS.toHexString();
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = "Smol Bodies Pets";
    collection.standard = "ERC721";
    collection.save();
  }

  return collection;
}

export function getOrCreateSmolBodiesPet(tokenId: BigInt): SmolBodiesPet {
  const collection = getOrCreateSmolBodiesCollection();
  const id = getTokenId(collection, tokenId);
  let token = SmolBodiesPet.load(id);
  
  if (!token) {
    token = new SmolBodiesPet(id);
    token.collection = collection.id;
    token.tokenId = tokenId;
  }

  return token;
}
