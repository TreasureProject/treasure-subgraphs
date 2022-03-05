import { BigDecimal } from "@graphprotocol/graph-ts";

export const CRAFT_DIFFICULTIES = ["Prism", "HarvesterPart", "Extractor"];

export const LEGION_CLASSES = [
  "Recruit",
  "Siege",
  "Fighter",
  "Assassin",
  "Ranged",
  "Spellcaster",
  "Riverman",
  "Numeraire",
  "AllClass",
  "Origin",
];

export const LEGION_GENERATIONS = ["Genesis", "Auxiliary", "Recruit"];

export const LEGION_RARITIES = [
  "Legendary",
  "Rare",
  "Special",
  "Uncommon",
  "Common",
  "None",
];

export const QUEST_DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const ONE_WEI = BigDecimal.fromString((1e18).toString());
