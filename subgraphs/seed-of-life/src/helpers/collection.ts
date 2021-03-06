import { Address, TypedMap, log } from "@graphprotocol/graph-ts";

import {
  BALANCER_CRYSTAL_ADDRESS,
  IMBUED_SOULS_ADDRESS,
  SEED_OF_LIFE_ADDRESS,
  SEED_OF_LIFE_RESOURCES_ADDRESS,
  SEED_OF_LIFE_TREASURES_ADDRESS,
} from "@treasure/constants";

import { Collection } from "../../generated/schema";
import {
  BALANCER_CRYSTAL_NAME,
  IMBUED_SOULS_NAME,
  SEED_OF_LIFE_NAME,
  SEED_OF_LIFE_RESOURCES_NAME,
  TREASURES_NAME,
} from "./constants";

const collections = new TypedMap<Address, string>();
collections.set(SEED_OF_LIFE_ADDRESS, SEED_OF_LIFE_NAME);
collections.set(SEED_OF_LIFE_RESOURCES_ADDRESS, SEED_OF_LIFE_RESOURCES_NAME);
collections.set(IMBUED_SOULS_ADDRESS, IMBUED_SOULS_NAME);
collections.set(BALANCER_CRYSTAL_ADDRESS, BALANCER_CRYSTAL_NAME);
collections.set(SEED_OF_LIFE_TREASURES_ADDRESS, TREASURES_NAME);

function getCollectionId(address: Address): string {
  return address.toHexString();
}

function getNameForCollection(address: Address): string {
  const nameEntry = collections.getEntry(address);
  if (!nameEntry) {
    log.warning("[collections] Unknown collection name: {}", [
      address.toHexString(),
    ]);
    return "Unknown";
  }

  return nameEntry.value;
}

export function getOrCreateCollection(address: Address): Collection {
  const id = getCollectionId(address);
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);
    collection.name = getNameForCollection(address);
    collection.save();
  }

  return collection;
}
