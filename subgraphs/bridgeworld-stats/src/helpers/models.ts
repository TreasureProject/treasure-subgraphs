import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import {
  AtlasMineLockStat,
  AtlasMineStat,
  CraftingDifficultyStat,
  CraftingStat,
  Legion,
  LegionStat,
  QuestingDifficultyStat,
  QuestingStat,
  SummoningStat,
  TreasureStat,
  User,
} from "../../generated/schema";
import { LEGION_GENERATIONS, LEGION_RARITIES } from "./constants";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  getDaysInMonth,
  getDaysInYear,
  getStartOfDay,
  getStartOfHour,
  getStartOfMonth,
  getStartOfWeek,
  getStartOfYear,
} from "./date";
import {
  getAllTimeId,
  getDailyId,
  getHourlyId,
  getLegionId,
  getMonthlyId,
  getWeeklyId,
  getYearlyId,
} from "./ids";
import { etherToWei } from "./number";
import { getName, getTier } from "./treasure";

export function getOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
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

export function getLegionName(
  tokenId: BigInt,
  generation: i32,
  rarity: i32
): string {
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

  return BigInt.zero();
}

export function getTimeIntervalAtlasMineStats(
  block: ethereum.Block
): AtlasMineStat[] {
  const stats: AtlasMineStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = AtlasMineStat.load(hourlyId);
    if (!hourlyStat) {
      hourlyStat = createAtlasMineStat(hourlyId);
      const startOfHour = getStartOfHour(timestamp);
      hourlyStat.interval = "Hourly";
      hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
      hourlyStat.endTimestamp = BigInt.fromI64(
        startOfHour + SECONDS_IN_HOUR - 1
      );
      hourlyStat.save();
    }

    stats.push(hourlyStat);
  }

  // Daily
  const dailyId = getDailyId(timestamp);
  let dailyStat = AtlasMineStat.load(dailyId);
  if (!dailyStat) {
    dailyStat = createAtlasMineStat(dailyId);
    const startOfDay = getStartOfDay(timestamp);
    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }
  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = AtlasMineStat.load(weeklyId);
  if (!weeklyStat) {
    weeklyStat = createAtlasMineStat(weeklyId);
    const startOfWeek = getStartOfWeek(timestamp);
    weeklyStat.interval = "Weekly";
    weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
    weeklyStat.endTimestamp = BigInt.fromI64(
      startOfWeek + SECONDS_IN_DAY * 7 - 1
    );
    weeklyStat.save();
  }
  stats.push(weeklyStat);

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  let monthlyStat = AtlasMineStat.load(monthlyId);
  if (!monthlyStat) {
    monthlyStat = createAtlasMineStat(monthlyId);
    const startOfMonth = getStartOfMonth(timestamp);
    monthlyStat.interval = "Monthly";
    monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
    monthlyStat.endTimestamp = BigInt.fromI64(
      startOfMonth + SECONDS_IN_DAY * getDaysInMonth(month, year) - 1
    );
    monthlyStat.save();
  }
  stats.push(monthlyStat);

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  let yearlyStat = AtlasMineStat.load(yearlyId);
  if (!yearlyStat) {
    yearlyStat = createAtlasMineStat(yearlyId);
    const startOfYear = getStartOfYear(timestamp);
    yearlyStat.interval = "Yearly";
    yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
    yearlyStat.endTimestamp = BigInt.fromI64(
      startOfYear + SECONDS_IN_DAY * getDaysInYear(year) - 1
    );
    yearlyStat.save();
  }
  stats.push(yearlyStat);

  // All-time
  const allTimeId = getAllTimeId();
  let allTimeStat = AtlasMineStat.load(allTimeId);
  if (!allTimeStat) {
    allTimeStat = createAtlasMineStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function createAtlasMineStat(id: string): AtlasMineStat {
  const stat = new AtlasMineStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.save();
  return stat;
}

export function getOrCreateAtlasMineLockStat(
  atlasMineStatId: string,
  lock: i32
): AtlasMineLockStat {
  const id = `${atlasMineStatId}-lock${lock}`;
  let lockStat = AtlasMineLockStat.load(id);
  if (!lockStat) {
    lockStat = new AtlasMineLockStat(id);
    lockStat.atlasMineStat = atlasMineStatId;
    lockStat.lock = lock;
    lockStat.save();
  }

  return lockStat;
}

export function getTimeIntervalCraftingStats(
  block: ethereum.Block
): CraftingStat[] {
  const stats: CraftingStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = CraftingStat.load(hourlyId);
    if (!hourlyStat) {
      hourlyStat = createCraftingStat(hourlyId);
      const startOfHour = getStartOfHour(timestamp);
      hourlyStat.interval = "Hourly";
      hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
      hourlyStat.endTimestamp = BigInt.fromI64(
        startOfHour + SECONDS_IN_HOUR - 1
      );
      hourlyStat.save();
    }

    stats.push(hourlyStat);
  }

  // Daily
  const dailyId = getDailyId(timestamp);
  let dailyStat = CraftingStat.load(dailyId);
  if (!dailyStat) {
    dailyStat = createCraftingStat(dailyId);
    const startOfDay = getStartOfDay(timestamp);
    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }
  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = CraftingStat.load(weeklyId);
  if (!weeklyStat) {
    weeklyStat = createCraftingStat(weeklyId);
    const startOfWeek = getStartOfWeek(timestamp);
    weeklyStat.interval = "Weekly";
    weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
    weeklyStat.endTimestamp = BigInt.fromI64(
      startOfWeek + SECONDS_IN_DAY * 7 - 1
    );
    weeklyStat.save();
  }
  stats.push(weeklyStat);

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  let monthlyStat = CraftingStat.load(monthlyId);
  if (!monthlyStat) {
    monthlyStat = createCraftingStat(monthlyId);
    const startOfMonth = getStartOfMonth(timestamp);
    monthlyStat.interval = "Monthly";
    monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
    monthlyStat.endTimestamp = BigInt.fromI64(
      startOfMonth + SECONDS_IN_DAY * getDaysInMonth(month, year) - 1
    );
    monthlyStat.save();
  }
  stats.push(monthlyStat);

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  let yearlyStat = CraftingStat.load(yearlyId);
  if (!yearlyStat) {
    yearlyStat = createCraftingStat(yearlyId);
    const startOfYear = getStartOfYear(timestamp);
    yearlyStat.interval = "Yearly";
    yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
    yearlyStat.endTimestamp = BigInt.fromI64(
      startOfYear + SECONDS_IN_DAY * getDaysInYear(year) - 1
    );
    yearlyStat.save();
  }
  stats.push(yearlyStat);

  // All-time
  const allTimeId = getAllTimeId();
  let allTimeStat = CraftingStat.load(allTimeId);
  if (!allTimeStat) {
    allTimeStat = createCraftingStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function createCraftingStat(id: string): CraftingStat {
  const stat = new CraftingStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
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
    stat.save();
  }

  return stat;
}

export function getTimeIntervalQuestingStats(
  block: ethereum.Block
): QuestingStat[] {
  const stats: QuestingStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = QuestingStat.load(hourlyId);
    if (!hourlyStat) {
      hourlyStat = createQuestingStat(hourlyId);
      const startOfHour = getStartOfHour(timestamp);
      hourlyStat.interval = "Hourly";
      hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
      hourlyStat.endTimestamp = BigInt.fromI64(
        startOfHour + SECONDS_IN_HOUR - 1
      );
      hourlyStat.save();
    }

    stats.push(hourlyStat);
  }

  // Daily
  const dailyId = getDailyId(timestamp);
  let dailyStat = QuestingStat.load(dailyId);
  if (!dailyStat) {
    dailyStat = createQuestingStat(dailyId);
    const startOfDay = getStartOfDay(timestamp);
    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }
  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = QuestingStat.load(weeklyId);
  if (!weeklyStat) {
    weeklyStat = createQuestingStat(weeklyId);
    const startOfWeek = getStartOfWeek(timestamp);
    weeklyStat.interval = "Weekly";
    weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
    weeklyStat.endTimestamp = BigInt.fromI64(
      startOfWeek + SECONDS_IN_DAY * 7 - 1
    );
    weeklyStat.save();
  }
  stats.push(weeklyStat);

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  let monthlyStat = QuestingStat.load(monthlyId);
  if (!monthlyStat) {
    monthlyStat = createQuestingStat(monthlyId);
    const startOfMonth = getStartOfMonth(timestamp);
    monthlyStat.interval = "Monthly";
    monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
    monthlyStat.endTimestamp = BigInt.fromI64(
      startOfMonth + SECONDS_IN_DAY * getDaysInMonth(month, year) - 1
    );
    monthlyStat.save();
  }
  stats.push(monthlyStat);

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  let yearlyStat = QuestingStat.load(yearlyId);
  if (!yearlyStat) {
    yearlyStat = createQuestingStat(yearlyId);
    const startOfYear = getStartOfYear(timestamp);
    yearlyStat.interval = "Yearly";
    yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
    yearlyStat.endTimestamp = BigInt.fromI64(
      startOfYear + SECONDS_IN_DAY * getDaysInYear(year) - 1
    );
    yearlyStat.save();
  }
  stats.push(yearlyStat);

  // All-time
  const allTimeId = getAllTimeId();
  let allTimeStat = QuestingStat.load(allTimeId);
  if (!allTimeStat) {
    allTimeStat = createQuestingStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function createQuestingStat(id: string): QuestingStat {
  const stat = new QuestingStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.save();
  return stat;
}

export function getOrCreateQuestingDifficultyStat(
  questingStatId: string,
  difficulty: string
): QuestingDifficultyStat {
  const id = `${questingStatId}-difficulty${difficulty}`;
  let stat = QuestingDifficultyStat.load(id);
  if (!stat) {
    stat = new QuestingDifficultyStat(id);
    stat.questingStat = questingStatId;
    stat.difficulty = difficulty;
    stat.save();
  }

  return stat;
}

export function getTimeIntervalSummoningStats(
  block: ethereum.Block
): SummoningStat[] {
  const stats: SummoningStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = SummoningStat.load(hourlyId);
    if (!hourlyStat) {
      hourlyStat = createSummoningStat(hourlyId);
      const startOfHour = getStartOfHour(timestamp);
      hourlyStat.interval = "Hourly";
      hourlyStat.startTimestamp = BigInt.fromI64(startOfHour);
      hourlyStat.endTimestamp = BigInt.fromI64(
        startOfHour + SECONDS_IN_HOUR - 1
      );
      hourlyStat.save();
    }

    stats.push(hourlyStat);
  }

  // Daily
  const dailyId = getDailyId(timestamp);
  let dailyStat = SummoningStat.load(dailyId);
  if (!dailyStat) {
    dailyStat = createSummoningStat(dailyId);
    const startOfDay = getStartOfDay(timestamp);
    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }
  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = SummoningStat.load(weeklyId);
  if (!weeklyStat) {
    weeklyStat = createSummoningStat(weeklyId);
    const startOfWeek = getStartOfWeek(timestamp);
    weeklyStat.interval = "Weekly";
    weeklyStat.startTimestamp = BigInt.fromI64(startOfWeek);
    weeklyStat.endTimestamp = BigInt.fromI64(
      startOfWeek + SECONDS_IN_DAY * 7 - 1
    );
    weeklyStat.save();
  }
  stats.push(weeklyStat);

  // Monthly
  const monthlyId = getMonthlyId(timestamp);
  let monthlyStat = SummoningStat.load(monthlyId);
  if (!monthlyStat) {
    monthlyStat = createSummoningStat(monthlyId);
    const startOfMonth = getStartOfMonth(timestamp);
    monthlyStat.interval = "Monthly";
    monthlyStat.startTimestamp = BigInt.fromI64(startOfMonth);
    monthlyStat.endTimestamp = BigInt.fromI64(
      startOfMonth + SECONDS_IN_DAY * getDaysInMonth(month, year) - 1
    );
    monthlyStat.save();
  }
  stats.push(monthlyStat);

  // Yearly
  const yearlyId = getYearlyId(timestamp);
  let yearlyStat = SummoningStat.load(yearlyId);
  if (!yearlyStat) {
    yearlyStat = createSummoningStat(yearlyId);
    const startOfYear = getStartOfYear(timestamp);
    yearlyStat.interval = "Yearly";
    yearlyStat.startTimestamp = BigInt.fromI64(startOfYear);
    yearlyStat.endTimestamp = BigInt.fromI64(
      startOfYear + SECONDS_IN_DAY * getDaysInYear(year) - 1
    );
    yearlyStat.save();
  }
  stats.push(yearlyStat);

  // All-time
  const allTimeId = getAllTimeId();
  let allTimeStat = SummoningStat.load(allTimeId);
  if (!allTimeStat) {
    allTimeStat = createSummoningStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function createSummoningStat(id: string): SummoningStat {
  const stat = new SummoningStat(id);
  stat._activeAddresses = [];
  stat._allAddresses = [];
  stat.save();
  return stat;
}

export function getOrCreateLegionStat(
  summoningStatId: string,
  legion: Legion
): LegionStat {
  const id = `${summoningStatId}-${legion.name
    .toLowerCase()
    .split(" ")
    .join("-")}`;
  let stat = LegionStat.load(id);
  if (!stat) {
    stat = new LegionStat(id);
    stat.generation = legion.generation;
    stat.rarity = legion.rarity;
    stat.name = legion.name;
    stat.save();
  }

  return stat;
}

export function getOrCreateTreasureStat(
  statId: string,
  tokenId: BigInt
): TreasureStat {
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
