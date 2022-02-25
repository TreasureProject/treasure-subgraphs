import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  AtlasMineLockStat,
  AtlasMineStat,
  CraftingDifficultyStat,
  CraftingStat,
  Legion,
  LegionStat,
  SummoningStat,
  TreasureStat,
  User
} from "../../generated/schema";
import { LEGION_GENERATIONS, LEGION_RARITIES, ZERO_BI } from "./constants";
import {
  getDaysInMonth,
  getDaysInYear,
  getStartOfDay,
  getStartOfHour,
  getStartOfMonth,
  getStartOfWeek,
  getStartOfYear,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR
} from "./date";
import {
  getAllTimeId,
  getDailyId,
  getHourlyId,
  getLegionId,
  getMonthlyId,
  getWeeklyId,
  getYearlyId
} from "./ids";
import { etherToWei } from "./number";
import { getName, getTier } from "./treasure";

export function getOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.magicDepositCount = 0;
    user.magicWithdrawCount = 0;
    user.magicHarvestCount = 0;
    user.magicDeposited = ZERO_BI;
    user.magicWithdrawn = ZERO_BI;
    user.magicHarvested = ZERO_BI;
    user.summonsStarted = 0;
    user.summonsFinished = 0;
    user.craftsStarted = 0;
    user.craftsFinished = 0;
    user.craftsSucceeded = 0;
    user.craftsFailed = 0;
    user.brokenTreasuresCount = 0;
    user.save();
  }

  return user;
}

export function getLegion(tokenId: BigInt): Legion | null {
  return Legion.load(getLegionId(tokenId));
}

export function getOrCreateLegion(tokenId: BigInt): Legion {
  const id = getLegionId(tokenId);
  let legion = Legion.load(id);
  if (!legion) {
    legion = new Legion(id);
    legion.tokenId = tokenId;
    legion.save();
  }

  return legion;
}

export function getCustomLegionName(tokenId: BigInt): string | null {
  switch (tokenId.toI32()) {
    case 523:
      return "Bombmaker";
    case 1629:
      return "Warlock";
    case 1744:
      return "Fallen";
    case 2239:
      return "Dreamwinder";
    case 3476:
      return "Clocksnatcher";
    default:
      return null;
  }
}

export function getLegionName(tokenId: BigInt, generation: i32, rarity: i32): string {
  const customName = getCustomLegionName(tokenId);
  if (customName) {
    return customName;
  }

  return `${LEGION_GENERATIONS[generation]} ${LEGION_RARITIES[rarity]}`;
}

export function getLegionSummonCost(generation: string): BigInt {
  if (generation == "Auxiliary") {
    return etherToWei(500);
  }

  if (generation == "Genesis") {
    return etherToWei(300);
  }

  return ZERO_BI;
}

export function getTimeIntervalAtlasMineStats(eventTimestamp: BigInt): AtlasMineStat[] {
  const timestamp = eventTimestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  // Hourly
  const hourlyId = getHourlyId(timestamp);
  const hourlyStat = (AtlasMineStat.load(hourlyId) || createAtlasMineStat(hourlyId)) as AtlasMineStat;
  const startOfHour = getStartOfHour(timestamp);
  hourlyStat.interval = "Hourly";
  hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
  hourlyStat.endTimestamp = BigInt.fromI64(startOfHour + SECONDS_IN_HOUR - 1);
  hourlyStat.save();

  // Daily
  const dailyId = getDailyId(timestamp);
  const dailyStat = (AtlasMineStat.load(dailyId) || createAtlasMineStat(dailyId)) as AtlasMineStat;
  const startOfDay = getStartOfDay(timestamp);
  dailyStat.interval = "Daily";
  dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
  dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
  dailyStat.save();

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  const weeklyStat = (AtlasMineStat.load(weeklyId) || createAtlasMineStat(weeklyId)) as AtlasMineStat;
  const startOfWeek = getStartOfWeek(timestamp);
  weeklyStat.interval = "Weekly";
  weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
  weeklyStat.endTimestamp = BigInt.fromI64(startOfWeek + (SECONDS_IN_DAY * 7) - 1);
  weeklyStat.save();

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  const monthlyStat = (AtlasMineStat.load(monthlyId) || createAtlasMineStat(monthlyId)) as AtlasMineStat;
  const startOfMonth = getStartOfMonth(timestamp);
  monthlyStat.interval = "Monthly";
  monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
  monthlyStat.endTimestamp = BigInt.fromI64(startOfMonth + (SECONDS_IN_DAY * getDaysInMonth(month, year)) - 1);
  monthlyStat.save();

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  const yearlyStat = (AtlasMineStat.load(yearlyId) || createAtlasMineStat(yearlyId)) as AtlasMineStat;
  const startOfYear = getStartOfYear(timestamp);
  yearlyStat.interval = "Yearly";
  yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
  yearlyStat.endTimestamp = BigInt.fromI64(startOfYear + (SECONDS_IN_DAY * getDaysInYear(year)) - 1);
  yearlyStat.save();

  // All-time
  const allTimeId = getAllTimeId();
  const allTimeStat = (AtlasMineStat.load(allTimeId) || createAtlasMineStat(allTimeId)) as AtlasMineStat;
  allTimeStat.interval = "AllTime";
  allTimeStat.save();

  return [
    hourlyStat,
    dailyStat,
    weeklyStat,
    monthlyStat,
    yearlyStat,
    allTimeStat
  ];
}

export function createAtlasMineStat(id: string): AtlasMineStat {
  const stat = new AtlasMineStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.magicDepositCount = 0;
  stat.magicWithdrawCount = 0;
  stat.magicHarvestCount = 0;
  stat.magicDeposited = ZERO_BI;
  stat.magicWithdrawn = ZERO_BI;
  stat.magicHarvested = ZERO_BI;
  stat.save();
  return stat;
}

export function getOrCreateAtlasMineLockStat(atlasMineStatId: string, lock: i32): AtlasMineLockStat {
  const id = `${atlasMineStatId}-lock${lock}`;
  let lockStat = AtlasMineLockStat.load(id);
  if (!lockStat) {
    lockStat = new AtlasMineLockStat(id);
    lockStat.atlasMineStat = atlasMineStatId;
    lockStat.lock = lock;
    lockStat.magicDepositCount = 0;
    lockStat.magicDeposited = ZERO_BI;
    lockStat.save();
  }

  return lockStat;
}

export function getTimeIntervalCraftingStats(eventTimestamp: BigInt): CraftingStat[] {
  const timestamp = eventTimestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  // Hourly
  const hourlyId = getHourlyId(timestamp);
  const hourlyStat = (CraftingStat.load(hourlyId) || createCraftingStat(hourlyId)) as CraftingStat;
  const startOfHour = getStartOfHour(timestamp);
  hourlyStat.interval = "Hourly";
  hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
  hourlyStat.endTimestamp = BigInt.fromI64(startOfHour + SECONDS_IN_HOUR - 1);
  hourlyStat.save();

  // Daily
  const dailyId = getDailyId(timestamp);
  const dailyStat = (CraftingStat.load(dailyId) || createCraftingStat(dailyId)) as CraftingStat;
  const startOfDay = getStartOfDay(timestamp);
  dailyStat.interval = "Daily";
  dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
  dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
  dailyStat.save();

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  const weeklyStat = (CraftingStat.load(weeklyId) || createCraftingStat(weeklyId)) as CraftingStat;
  const startOfWeek = getStartOfWeek(timestamp);
  weeklyStat.interval = "Weekly";
  weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
  weeklyStat.endTimestamp = BigInt.fromI64(startOfWeek + (SECONDS_IN_DAY * 7) - 1);
  weeklyStat.save();

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  const monthlyStat = (CraftingStat.load(monthlyId) || createCraftingStat(monthlyId)) as CraftingStat;
  const startOfMonth = getStartOfMonth(timestamp);
  monthlyStat.interval = "Monthly";
  monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
  monthlyStat.endTimestamp = BigInt.fromI64(startOfMonth + (SECONDS_IN_DAY * getDaysInMonth(month, year)) - 1);
  monthlyStat.save();

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  const yearlyStat = (CraftingStat.load(yearlyId) || createCraftingStat(yearlyId)) as CraftingStat;
  const startOfYear = getStartOfYear(timestamp);
  yearlyStat.interval = "Yearly";
  yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
  yearlyStat.endTimestamp = BigInt.fromI64(startOfYear + (SECONDS_IN_DAY * getDaysInYear(year)) - 1);
  yearlyStat.save();

  // All-time
  const allTimeId = getAllTimeId();
  const allTimeStat = (CraftingStat.load(allTimeId) || createCraftingStat(allTimeId)) as CraftingStat;
  allTimeStat.interval = "AllTime";
  allTimeStat.save();

  return [
    hourlyStat,
    dailyStat,
    weeklyStat,
    monthlyStat,
    yearlyStat,
    allTimeStat
  ];
}

export function createCraftingStat(id: string): CraftingStat {
  const stat = new CraftingStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.magicConsumed = ZERO_BI;
  stat.magicReturned = ZERO_BI;
  stat.craftsStarted = 0;
  stat.craftsFinished = 0;
  stat.craftsSucceeded = 0;
  stat.craftsFailed = 0;
  stat.save();
  return stat;
}

export function getOrCreateCraftingDifficultyStat(
  craftingStatId: string,
  difficulty: string
): CraftingDifficultyStat {
  const id = `${craftingStatId}-difficulty${difficulty}`;
  let stat = CraftingDifficultyStat.load(id);
  if (!stat) {
    stat = new CraftingDifficultyStat(id);
    stat.craftingStat = craftingStatId;
    stat.difficulty = difficulty;
    stat.magicConsumed = ZERO_BI;
    stat.magicReturned = ZERO_BI;
    stat.craftsStarted = 0;
    stat.craftsFinished = 0;
    stat.craftsSucceeded = 0;
    stat.craftsFailed = 0;
    stat.brokenTreasuresCount = 0;
    stat.save();
  }

  return stat;
}

export function getTimeIntervalSummoningStats(eventTimestamp: BigInt): SummoningStat[] {
  const timestamp = eventTimestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  // Hourly
  const hourlyId = getHourlyId(timestamp);
  const hourlyStat = (SummoningStat.load(hourlyId) || createSummoningStat(hourlyId)) as SummoningStat;
  const startOfHour = getStartOfHour(timestamp);
  hourlyStat.interval = "Hourly";
  hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
  hourlyStat.endTimestamp = BigInt.fromI64(startOfHour + SECONDS_IN_HOUR - 1);
  hourlyStat.save();

  // Daily
  const dailyId = getDailyId(timestamp);
  const dailyStat = (SummoningStat.load(dailyId) || createSummoningStat(dailyId)) as SummoningStat;
  const startOfDay = getStartOfDay(timestamp);
  dailyStat.interval = "Daily";
  dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
  dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
  dailyStat.save();

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  const weeklyStat = (SummoningStat.load(weeklyId) || createSummoningStat(weeklyId)) as SummoningStat;
  const startOfWeek = getStartOfWeek(timestamp);
  weeklyStat.interval = "Weekly";
  weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
  weeklyStat.endTimestamp = BigInt.fromI64(startOfWeek + (SECONDS_IN_DAY * 7) - 1);
  weeklyStat.save();

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  const monthlyStat = (SummoningStat.load(monthlyId) || createSummoningStat(monthlyId)) as SummoningStat;
  const startOfMonth = getStartOfMonth(timestamp);
  monthlyStat.interval = "Monthly";
  monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
  monthlyStat.endTimestamp = BigInt.fromI64(startOfMonth + (SECONDS_IN_DAY * getDaysInMonth(month, year)) - 1);
  monthlyStat.save();

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  const yearlyStat = (SummoningStat.load(yearlyId) || createSummoningStat(yearlyId)) as SummoningStat;
  const startOfYear = getStartOfYear(timestamp);
  yearlyStat.interval = "Yearly";
  yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
  yearlyStat.endTimestamp = BigInt.fromI64(startOfYear + (SECONDS_IN_DAY * getDaysInYear(year)) - 1);
  yearlyStat.save();

  // All-time
  const allTimeId = getAllTimeId();
  const allTimeStat = (SummoningStat.load(allTimeId) || createSummoningStat(allTimeId)) as SummoningStat;
  allTimeStat.interval = "AllTime";
  allTimeStat.save();

  return [
    hourlyStat,
    dailyStat,
    weeklyStat,
    monthlyStat,
    yearlyStat,
    allTimeStat
  ];
}

export function createSummoningStat(id: string): SummoningStat {
  const stat = new SummoningStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.magicSpent = ZERO_BI;
  stat.summonsStarted = 0;
  stat.summonsFinished = 0;
  stat.save();
  return stat;
}

export function getOrCreateLegionStat(statId: string, legion: Legion): LegionStat {
  const id = `${statId}-${legion.name.toLowerCase().split(" ").join("-")}`;
  let stat = LegionStat.load(id);
  if (!stat) {
    stat = new LegionStat(id);
    stat.generation = legion.generation;
    stat.rarity = legion.rarity;
    stat.name = legion.name;
    stat.summoningMagicSpent = ZERO_BI;
    stat.summonsStarted = 0;
    stat.summonsFinished = 0;
    stat.summonedCount = 0;
    stat.craftsStarted = 0;
    stat.craftsFinished = 0;
    stat.craftsSucceeded = 0;
    stat.craftsFailed = 0;
    stat.save();
  }

  return stat;
}

export function getOrCreateTreasureStat(statId: string, tokenId: BigInt): TreasureStat {
  const id = `${statId}-${tokenId.toHexString()}`;
  let stat = TreasureStat.load(id);
  if (!stat) {
    stat = new TreasureStat(id);
    stat.tokenId = tokenId;
    stat.name = getName(tokenId);
    stat.tier = getTier(tokenId);
    stat.save();
  }

  return stat;
}
