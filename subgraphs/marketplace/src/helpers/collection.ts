import {
  BATTLEFLY_ADDRESS,
  BATTLEFLY_FOUNDERS_ADDRESS,
  CONSUMABLE_ADDRESS,
  EXTRA_LIFE_ADDRESS,
  KEYS_ADDRESS,
  LEGACY_LEGION_ADDRESS,
  LEGACY_LEGION_GENESIS_ADDRESS,
  LEGION_ADDRESS,
  SEED_OF_LIFE_ADDRESS,
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
  SMOL_CARS_ADDRESS,
  SMOL_TREASURES_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

export function getAllCollections(): string[] {
  return [
    BATTLEFLY_ADDRESS,
    CONSUMABLE_ADDRESS,
    EXTRA_LIFE_ADDRESS,
    KEYS_ADDRESS,
    LEGACY_LEGION_ADDRESS,
    LEGACY_LEGION_GENESIS_ADDRESS,
    SEED_OF_LIFE_ADDRESS,
    SMOL_BODIES_ADDRESS,
    SMOL_BODIES_PETS_ADDRESS,
    SMOL_BRAINS_ADDRESS,
    SMOL_BRAINS_LAND_ADDRESS,
    SMOL_BRAINS_PETS_ADDRESS,
    SMOL_CARS_ADDRESS,
    SMOL_TREASURES_ADDRESS,
    TREASURE_ADDRESS,
  ]
    .map<string>((address) => address.toHexString())
    .concat(
      [0, 1, 2].map<string>(
        (suffix) => `${LEGION_ADDRESS.toHexString()}-${suffix}`
      )
    )
    .concat(
      [1, 2].map<string>(
        (suffix) => `${BATTLEFLY_FOUNDERS_ADDRESS.toHexString()}-${suffix}`
      )
    );
}

export function getBattleflyFounderVersion(tokenId: i32): i32 {
  switch (true) {
    case tokenId > 0 && tokenId < 221:
      return 1;
    case tokenId > 220 && tokenId < 4221:
      return 2;
    default:
      return 0;
  }
}
