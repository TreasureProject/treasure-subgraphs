import { Address, TypedMap } from "@graphprotocol/graph-ts";
import {
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS
} from "@treasure/constants";
import { log } from "matchstick-as";

import {
  SMOL_BODIES_COLLECTION_NAME,
  SMOL_BODIES_PETS_COLLECTION_NAME,
  SMOL_BRAINS_COLLECTION_NAME,
  SMOL_BRAINS_PETS_COLLECTION_NAME
} from "./constants";

const collections = new TypedMap<Address, string>();
collections.set(SMOL_BODIES_ADDRESS, SMOL_BODIES_COLLECTION_NAME);
collections.set(SMOL_BRAINS_ADDRESS, SMOL_BRAINS_COLLECTION_NAME);
collections.set(SMOL_BODIES_PETS_ADDRESS, SMOL_BODIES_PETS_COLLECTION_NAME);
collections.set(SMOL_BRAINS_PETS_ADDRESS, SMOL_BRAINS_PETS_COLLECTION_NAME);

export function getNameForCollection(address: Address): string {
  const nameEntry = collections.getEntry(address);
  if (!nameEntry) {
    log.warning("[collections] Unknown collection name: {}", [address.toHexString()]);
    return "Unknown";
  }

  return nameEntry.value;
}
