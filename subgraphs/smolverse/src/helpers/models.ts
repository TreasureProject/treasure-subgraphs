import { Address, BigDecimal, BigInt, TypedMap } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";
import { log } from "matchstick-as";

import { Attribute, Collection, Token, User } from "../../generated/schema";
import { getAttributeId, getTokenId } from "./ids";
import { toBigDecimal } from "./number";

const ATTRIBUTE_PERCENTAGE_THRESHOLDS = new TypedMap<string, number>();
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BODIES_PETS_ADDRESS.toHexString(), 5_500);

const shouldUpdateAttributePercentages = (collection: Collection): boolean => {
  const threshold = ATTRIBUTE_PERCENTAGE_THRESHOLDS.getEntry(collection.id);
  const thresholdValue = threshold ? threshold.value : 0;
  return collection._tokenIds.length >= thresholdValue;
};

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

export function getOrCreateCollection(address: Address, name: string, standard: string): Collection {
  const id = address.toHexString();
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = name;
    collection.standard = standard;
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

export function updateAttributePercentages(collection: Collection): void {
  if (!shouldUpdateAttributePercentages(collection)) {
    log.info("Skipping attribute percentages update for collection: {}", [collection.id]);
    return;
  }

  const attributeIds = collection._attributeIds;
  const totalTokens = collection._tokenIds.length;
  const totalAttributes = attributeIds.length;
  for (let i = 0; i < totalAttributes; i++) {
    const attribute = Attribute.load(attributeIds[i]);
    if (!attribute) {
      log.warning("Unknown attribute in collection: {}", [attributeIds[i]]);
      continue;
    }

    attribute.percentage =
      toBigDecimal(attribute._tokenIds.length)
        .div(toBigDecimal(totalTokens))
        .truncate(4);
    attribute.save();
  }
}
