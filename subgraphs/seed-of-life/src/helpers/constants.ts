import { BigInt } from "@graphprotocol/graph-ts";

// Collections
export const SEED_OF_LIFE_NAME = "Seed of Life";
export const SEED_OF_LIFE_ITEMS_NAME = "Seed of Life Items";
export const IMBUED_SOUL_NAME = "Imbued Soul";
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

export class OffensiveSkill {
  private static _names: Array<string> = [
    "NONE",
    "BERSERKER",
    "METEOR_SWARM",
    "HOLY_ARROW",
    "MULTISHOT",
    "SUMMON_MINION",
    "THORS_HAMMER",
    "MINDBURN",
    "BACKSTAB",
  ];

  public static getName(intValue: number): string {
    if (intValue >= this._names.length) {
      throw new Error(`Bad enum value: ${intValue}`);
    }

    return this._names.at(intValue as i32);
  }
}

export class SecondarySkill {
  private static _names: Array<string> = [
    "POTION_OF_SWIFTNESS",
    "POTION_OF_RECOVERY",
    "POTION_OF_GLUTTONY",
    "BEGINNER_GARDENING_KIT",
    "INTERMEDIATE_GARDENING_KIT",
    "EXPERT_GARDENING_KIT",
    "SHADOW_WALK",
    "SHADOW_ASSAULT",
    "SHADOW_OVERLORD",
    "SPEAR_OF_FIRE",
    "SPEAR_OF_FLAME",
    "SPEAR_OF_INFERNO",
    "SUMMON_BROWN_BEAR",
    "SUMMON_LESSER_DAEMON",
    "SUMMON_ANCIENT_WYRM",
    "HOUSING_DEED_SMALL_COTTAGE",
    "HOUSING_DEED_MEDIUM_TOWER",
    "HOUSING_DEED_LARGE_CASTLE",
    "DEMONIC_BLAST",
    "DEMONIC_WAVE",
    "DEMONIC_NOVA",
    "RADIANT_BLESSING",
    "DIVING_BLESSING",
    "CELESTIAL_BLESSIN",
  ];

  public static getName(intValue: number): string {
    if (intValue >= this._names.length) {
      throw new Error(`Bad enum value: ${intValue}`);
    }

    return this._names.at(intValue as i32);
  }
}
