import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const DIFFICULTY = [
  "Easy",
  "Medium",
  "Hard",
  "PrismUpgradeSmallToMedium",
  "PrismUpgradeMediumToLarge",
];
export const LEGION_IPFS =
  "ipfs://QmUAkX9dKHzyUqvxfjqBb8zrGxkU3XdqXBFyrs17qbpFZo";
export const LEGION_NO_BACKGROUND_IPFS =
  "ipfs://QmZgB2nv7ZwqWQboYeeip83vT3RJf41YH24UjTacR9v7zF";
export const LEGION_PFP_IPFS =
  "ipfs://QmdJAn4pHVyUFGcPPTVtcNQgkoWcD9YX9BfJgrSjMMAeN5";
export const TREASURE_FRAGMENT_IPFS =
  "ipfs://QmUv5UT7X9qahf8bqcqZjX7TKqrJeMyRX3kxjVowz2WkRm";

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
