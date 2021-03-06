import { BigInt } from "@graphprotocol/graph-ts";

// Collections
export const SEED_OF_LIFE_NAME = "Seed of Life";
export const SEED_OF_LIFE_RESOURCES_NAME = "Seed of Life Resources";
export const IMBUED_SOULS_NAME = "Imbued Souls";
export const BALANCER_CRYSTAL_NAME = "Balancer Crystal";
export const TREASURES_NAME = "Treasures";

// TokenStandards
export const TOKEN_STANDARD_ERC721 = "ERC721";
export const TOKEN_STANDARD_ERC1155 = "ERC1155";

// Numbers
export const ONE_BI = BigInt.fromI32(1);

export class Path {
  private static _names: Array<string> = ["NO_MAGIC", "MAGIC", "MAGIC_AND_BC"];

  public static getName(intValue: number): string {
    if (intValue >= this._names.length) {
      throw new Error(`Bad enum value: ${intValue}`);
    }

    return this._names.at(intValue as i32);
  }
}

export class LifeformRealm {
  private static _names: Array<string> = [
    "VESPER",
    "SHERWOOD",
    "THOUSAND_ISLES",
    "TUL_NIELOHG_DESERT",
    "DULKHAN_MOUNTAINS",
    "MOLTANIA",
    "NETHEREALM",
    "MAGINCIA",
  ];

  public static getName(intValue: number): string {
    if (intValue >= this._names.length) {
      throw new Error(`Bad enum value: ${intValue}`);
    }

    return this._names.at(intValue as i32);
  }
}

export class LifeformClass {
  private static _names: Array<string> = [
    "WARRIOR",
    "MAGE",
    "PRIEST",
    "SHARPSHOOTER",
    "SUMMONER",
    "PALADIN",
    "ASURA",
    "SLAYER",
  ];

  public static getName(intValue: number): string {
    if (intValue >= this._names.length) {
      throw new Error(`Bad enum value: ${intValue}`);
    }

    return this._names.at(intValue as i32);
  }
}
