import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

// Numbers
export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ONE_WEI = BigDecimal.fromString((1e18).toString());

// Seed of Life
export const ORDERED_REALMS = [
  "VESPER",
  "SHERWOOD",
  "THOUSAND_ISLES",
  "TUL_NIELOHG_DESERT",
  "DULKHAN_MOUNTAINS",
  "MOLTANIA",
  "NETHEREALM",
  "MAGINCIA",
];

export const ORDERED_PATHS = ["NO_MAGIC", "MAGIC", "MAGIC_AND_BC"];

export const ORDERED_CLASSES = [
  "WARRIOR",
  "MAGE",
  "PRIEST",
  "SHARPSHOOTER",
  "SUMMONER",
  "PALADIN",
  "ASURA",
  "SLAYER",
];
