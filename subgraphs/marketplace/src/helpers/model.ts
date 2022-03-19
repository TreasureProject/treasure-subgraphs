import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  BATTLEFLY_FOUNDERS_ADDRESS,
  LEGION_ADDRESS,
} from "@treasure/constants";

import { getAddressId, getBattleflyFounderVersion, getName } from ".";
import { Collection, StatsData, Token } from "../../generated/schema";

function createCollection(
  contract: Address,
  name: string,
  standard: string,
  suffix: string = ""
): void {
  let id = `${contract.toHexString()}${suffix}`;
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);

    collection.contract = contract.toHexString();
    collection.listings = [];
    collection.name = name;
    collection.standard = standard;
    collection.stats = id;

    new StatsData(id).save();

    collection.save();
  }
}

export function createErc721Collection(contract: Address, name: string): void {
  createCollection(contract, name, "ERC721");
}

export function createErc1155Collection(contract: Address, name: string): void {
  createCollection(contract, name, "ERC1155");
}

export function createBattleflyFoundersCollection(
  contract: Address,
  name: string,
  version: i32
): void {
  createCollection(contract, name, "ERC721", `-${version}`);
}

export function createLegionsCollection(
  contract: Address,
  name: string,
  generation: i32
): void {
  createCollection(contract, name, "ERC721", `-${generation}`);
}

export function getCollection(id: string): Collection {
  let collection = Collection.load(id);

  // Should never happen, famous last words
  if (!collection) {
    collection = new Collection(id);

    log.warning("Unknown collection: {}", [id]);
  }

  return collection;
}

export function getStats(id: string): StatsData {
  let stats = StatsData.load(id);

  if (!stats) {
    stats = new StatsData(id);
  }

  return stats;
}

export function getToken(contract: Address, tokenId: BigInt): Token {
  let id = getAddressId(contract, tokenId);
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);

    // Legion setup is done with LegionCreated event
    if (contract.notEqual(LEGION_ADDRESS)) {
      let collectionId = contract.toHexString();

      if (contract.equals(BATTLEFLY_FOUNDERS_ADDRESS)) {
        collectionId += `-${getBattleflyFounderVersion(tokenId.toI32())}`;
      }

      let collection = getCollection(collectionId);

      token.collection = collection.id;

      if (collection.standard == "ERC721") {
        token.name = `${collection.name} #${tokenId.toString()}`;
      } else {
        token.name = getName(contract, tokenId);
        token.stats = id;

        new StatsData(id).save();
      }
    }

    token.tokenId = tokenId;
    token.save();
  }

  return token;
}
