// Collections
export const SEED_OF_LIFE_NAME = "Seed of Life";
export const SEED_OF_LIFE_ITEMS_NAME = "Seed of Life Items";
export const IMBUED_SOUL_NAME = "Imbued Soul";
export const BALANCER_CRYSTAL_NAME = "Balancer Crystal";
export const TREASURES_NAME = "Treasures";

// TokenStandards
export const TOKEN_STANDARD_ERC721 = "ERC721";
export const TOKEN_STANDARD_ERC1155 = "ERC1155";

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
