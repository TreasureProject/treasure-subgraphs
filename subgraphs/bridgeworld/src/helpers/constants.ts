import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const DIFFICULTY = ["Easy", "Medium", "Hard"];
export const CONSUMABLE_IPFS =
  "ipfs://Qma82rv8QoVuBkWUcovNcDbxHFaCEGrNHr5XtmdvKE4W98/Consumables";
export const LEGION_IPFS =
  "ipfs://QmcGBi7aeTtg7nn2L3L25nmoXjVp9R19fzLwm4SNh6vPBM";
export const LEGION_PFP_IPFS =
  "ipfs://QmScXFZ6ZzqifY4g9iy3tpCzko5PUGL99NPoic5waKmiNj";
export const TREASURE_FRAGMENT_IPFS =
  "ipfs://QmUv5UT7X9qahf8bqcqZjX7TKqrJeMyRX3kxjVowz2WkRm";
export const SUMMONING_SUCCESS_SENSITIVITY: f32 = 1;

export const QUEST_DISTANCE_TRAVELLED_PER_PART = 10;

const DAY = 86_400;
const ONE_WEEK = DAY * 7;
const TWO_WEEKS = ONE_WEEK * 2;
const ONE_MONTH = DAY * 30;
const THREE_MONTHS = ONE_MONTH * 3;
const SIX_MONTHS = ONE_MONTH * 6;
const TWELVE_MONTHS = DAY * 365;
export const LOCK_PERIOD_IN_SECONDS = [
  TWO_WEEKS,
  ONE_MONTH,
  THREE_MONTHS,
  SIX_MONTHS,
  TWELVE_MONTHS,
];

export const ONE_WEI = BigDecimal.fromString((1e18).toString());
export const ZERO_BI = BigInt.zero();
export const ONE_BI = BigInt.fromI32(1);
export const TWO_BI = BigInt.fromI32(2);
