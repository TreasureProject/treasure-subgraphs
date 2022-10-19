import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { SMOL_TREASURES_ADDRESS } from "@treasure/constants";

import {
  Attribute,
  Collection,
  Random,
  Seeded,
  Token,
  User,
} from "../../generated/schema";
import { getNameForCollection } from "./collections";
import {
  SMOL_TREASURES_COLLECTION_NAME,
  SMOL_TREASURES_IMAGES_BASE_URI,
  TOKEN_STANDARD_ERC721,
} from "./constants";
import {
  getAttributeId,
  getCollectionId,
  getRandomId,
  getSeededId,
  getTokenId,
} from "./ids";
import { getTreasureTokenName } from "./treasures";

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

export function getOrCreateCollection(
  address: Address,
  includeNameInTokenName: boolean = true
): Collection {
  const id = getCollectionId(address);
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = getNameForCollection(address);
    collection.standard = TOKEN_STANDARD_ERC721;
    collection._attributeIds = [];
    collection._includeNameInTokenName = includeNameInTokenName;
    collection._missingMetadataLastUpdated = BigInt.zero();
    collection._missingMetadataTokens = [];
    collection._tokenIds = [];
    collection.stakedTokensCount = 0;
    collection.tokensCount = 0;
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
    token.collection = collection.id;
    token.tokenId = tokenId;
    token.attributes = [];
    token.save();

    collection.tokensCount += 1;
    collection.save();
  }

  return token;
}

export function removeToken(collection: Collection, tokenId: BigInt): void {
  collection.tokensCount -= 1;
  collection.save();

  store.remove("Token", getTokenId(collection, tokenId));
}

export function getOrCreateRewardToken(tokenId: BigInt): Token {
  const collection = getOrCreateCollection(SMOL_TREASURES_ADDRESS);
  const id = getTokenId(collection, tokenId);
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);
    token.collection = collection.id;
    token.tokenId = tokenId;
    token.name = getTreasureTokenName(tokenId);
    token.description = SMOL_TREASURES_COLLECTION_NAME;
    token.image = `${SMOL_TREASURES_IMAGES_BASE_URI}${tokenId
      .minus(BigInt.fromI32(1))
      .toString()}.gif`;
    token.save();

    collection.tokensCount += 1;
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
