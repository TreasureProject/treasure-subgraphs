import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import {
  AtlasMineLockStat,
  AtlasMineStat,
  ConsumableStat,
  CraftingDifficultyStat,
  CraftingStat,
  Legion,
  LegionStat,
  PilgrimageStat,
  QuestingDifficultyStat,
  QuestingStat,
  SummoningStat,
  TreasureStat,
  UserStat,
} from "../../generated/schema";
import { LEGION_GENERATIONS, LEGION_RARITIES } from "./constants";
import { getConsumableName } from "./consumable";
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
import { getTier, getTreasureName } from "./treasure";

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

  const generationStr = LEGION_GENERATIONS[generation];
  if (generationStr == "Recruit") {
    return generationStr;
  }

  return `${generationStr} ${LEGION_RARITIES[rarity]}`;
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
      hourlyStat = new AtlasMineStat(hourlyId);
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
    dailyStat = new AtlasMineStat(dailyId);
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
    weeklyStat = new AtlasMineStat(weeklyId);
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
    monthlyStat = new AtlasMineStat(monthlyId);
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
    yearlyStat = new AtlasMineStat(yearlyId);
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
    allTimeStat = new AtlasMineStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function getOrCreateAtlasMineLockStat(
  atlasMineStatId: string,
  lock: i32,
  startTimeStamp: BigInt | null = null,
  endTimestamp: BigInt | null = null
): AtlasMineLockStat {
  const id = `${atlasMineStatId}-lock${lock}`;
  let lockStat = AtlasMineLockStat.load(id);
  if (!lockStat) {
    lockStat = new AtlasMineLockStat(id);
    lockStat.startTimestamp = startTimeStamp;
    lockStat.endTimestamp = endTimestamp;
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
      hourlyStat = new CraftingStat(hourlyId);
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
    dailyStat = new CraftingStat(dailyId);
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
    weeklyStat = new CraftingStat(weeklyId);
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
    monthlyStat = new CraftingStat(monthlyId);
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
    yearlyStat = new CraftingStat(yearlyId);
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
    allTimeStat = new CraftingStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function getOrCreateCraftingDifficultyStat(
  craftingStatId: string,
  difficulty: string,
  startTimeStamp: BigInt | null = null,
  endTimestamp: BigInt | null = null
): CraftingDifficultyStat {
  const id = `${craftingStatId}-difficulty${difficulty}`;
  let stat = CraftingDifficultyStat.load(id);
  if (!stat) {
    stat = new CraftingDifficultyStat(id);
    stat.startTimestamp = startTimeStamp;
    stat.endTimestamp = endTimestamp;
    stat.craftingStat = craftingStatId;
    stat.difficulty = difficulty;
    stat.save();
  }

  return stat;
}

export function getTimeIntervalPilgrimageStats(
  block: ethereum.Block
): PilgrimageStat[] {
  const stats: PilgrimageStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = PilgrimageStat.load(hourlyId);
    if (!hourlyStat) {
      hourlyStat = new PilgrimageStat(hourlyId);
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
  let dailyStat = PilgrimageStat.load(dailyId);
  if (!dailyStat) {
    dailyStat = new PilgrimageStat(dailyId);
    const startOfDay = getStartOfDay(timestamp);
    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }
  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = PilgrimageStat.load(weeklyId);
  if (!weeklyStat) {
    weeklyStat = new PilgrimageStat(weeklyId);
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
  let monthlyStat = PilgrimageStat.load(monthlyId);
  if (!monthlyStat) {
    monthlyStat = new PilgrimageStat(monthlyId);
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
  let yearlyStat = PilgrimageStat.load(yearlyId);
  if (!yearlyStat) {
    yearlyStat = new PilgrimageStat(yearlyId);
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
  let allTimeStat = PilgrimageStat.load(allTimeId);
  if (!allTimeStat) {
    allTimeStat = new PilgrimageStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
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
      hourlyStat = new QuestingStat(hourlyId);
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
    dailyStat = new QuestingStat(dailyId);
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
    weeklyStat = new QuestingStat(weeklyId);
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
    monthlyStat = new QuestingStat(monthlyId);
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
    yearlyStat = new QuestingStat(yearlyId);
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
    allTimeStat = new QuestingStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function getOrCreateQuestingDifficultyStat(
  questingStatId: string,
  difficulty: string,
  startTimeStamp: BigInt | null = null,
  endTimestamp: BigInt | null = null
): QuestingDifficultyStat {
  const id = `${questingStatId}-difficulty${difficulty}`;
  let stat = QuestingDifficultyStat.load(id);
  if (!stat) {
    stat = new QuestingDifficultyStat(id);
    stat.startTimestamp = startTimeStamp;
    stat.endTimestamp = endTimestamp;
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
      hourlyStat = new SummoningStat(hourlyId);
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
    dailyStat = new SummoningStat(dailyId);
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
    weeklyStat = new SummoningStat(weeklyId);
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
    monthlyStat = new SummoningStat(monthlyId);
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
    yearlyStat = new SummoningStat(yearlyId);
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
    allTimeStat = new SummoningStat(allTimeId);
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }
  stats.push(allTimeStat);

  return stats;
}

export function getOrCreateUserStat(
  statId: string,
  address: Address,
  startTimestamp: BigInt | null = null,
  endTimestamp: BigInt | null = null,
  interval: string | null = null
): UserStat {
  const id = `${statId}-${address.toHexString()}`;
  let stat = UserStat.load(id);
  if (!stat) {
    stat = new UserStat(id);
    stat.address = address.toHexString();
    stat.startTimestamp = startTimestamp;
    stat.endTimestamp = endTimestamp;
    stat.interval = (interval || "AllTime") as string;
    stat.save();
  }

  return stat;
}

export function getOrCreateLegionStat(
  summoningStatId: string,
  legion: Legion,
  startTimestamp: BigInt | null = null,
  endTimestamp: BigInt | null = null,
  withClass: boolean = false
): LegionStat {
  const id = [
    summoningStatId,
    legion.name.toLowerCase().split(" ").join("-"),
    withClass ? legion.legionClass.toLowerCase() : null,
  ]
    .filter((x) => !!x)
    .join("-");
  let stat = LegionStat.load(id);
  if (!stat) {
    stat = new LegionStat(id);
    stat.startTimestamp = startTimestamp;
    stat.endTimestamp = endTimestamp;
    stat.generation = legion.generation;
    stat.rarity = legion.rarity;
    if (withClass) {
      stat.legionClass = legion.legionClass;
    }
    stat.name = legion.name;
    stat.save();
  }

  return stat;
}

export function getOrCreateConsumableStat(
  statId: string,
  tokenId: BigInt
): ConsumableStat {
  const id = `${statId}-${tokenId.toHexString()}`;
  let stat = ConsumableStat.load(id);
  if (!stat) {
    stat = new ConsumableStat(id);
    stat.tokenId = tokenId;
    stat.name = getConsumableName(tokenId);
    stat.save();
  }

  return stat;
}

export function getOrCreateTreasureStat(
  statId: string,
  tokenId: BigInt,
  startTimestamp: BigInt | null = null,
  endTimestamp: BigInt | null = null
): TreasureStat {
  const id = `${statId}-${tokenId.toHexString()}`;
  let stat = TreasureStat.load(id);
  if (!stat) {
    stat = new TreasureStat(id);
    stat.startTimestamp = startTimestamp;
    stat.endTimestamp = endTimestamp;
    stat.tokenId = tokenId;
    stat.name = getTreasureName(tokenId);
    stat.tier = getTier(tokenId);
    stat.save();
  }

  return stat;
}
