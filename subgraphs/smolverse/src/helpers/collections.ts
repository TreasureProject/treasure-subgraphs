import { Address, TypedMap, log } from "@graphprotocol/graph-ts";

import {
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
  SMOL_TREASURES_ADDRESS,
  SWOLERCYCLES_ADDRESS,
  WRAPPED_SMOLS_ADDRESS,
} from "@treasure/constants";

import {
  SMOL_BODIES_COLLECTION_NAME,
  SMOL_BODIES_PETS_COLLECTION_NAME,
  SMOL_BRAINS_COLLECTION_NAME,
  SMOL_BRAINS_LAND_COLLECTION_NAME,
  SMOL_BRAINS_PETS_COLLECTION_NAME,
  SMOL_TREASURES_COLLECTION_NAME,
  SWOLERCYCLES_COLLECTION_NAME,
  WRAPPED_SMOLS_COLLECTTION_NAME,
} from "./constants";

const collections = new TypedMap<Address, string>();

collections.set(SMOL_BODIES_ADDRESS, SMOL_BODIES_COLLECTION_NAME);
collections.set(SMOL_BRAINS_ADDRESS, SMOL_BRAINS_COLLECTION_NAME);
collections.set(SMOL_BRAINS_LAND_ADDRESS, SMOL_BRAINS_LAND_COLLECTION_NAME);
collections.set(SMOL_BODIES_PETS_ADDRESS, SMOL_BODIES_PETS_COLLECTION_NAME);
collections.set(SMOL_BRAINS_PETS_ADDRESS, SMOL_BRAINS_PETS_COLLECTION_NAME);
collections.set(SMOL_TREASURES_ADDRESS, SMOL_TREASURES_COLLECTION_NAME);
collections.set(SWOLERCYCLES_ADDRESS, SWOLERCYCLES_COLLECTION_NAME);
collections.set(WRAPPED_SMOLS_ADDRESS, WRAPPED_SMOLS_COLLECTTION_NAME);

export function getNameForCollection(address: Address): string {
  const nameEntry = collections.getEntry(address);
  if (!nameEntry) {
    log.warning("[collections] Unknown collection name: {}", [
      address.toHexString(),
    ]);
    return "Unknown";
  }

  return nameEntry.value;
}
