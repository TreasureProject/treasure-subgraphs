import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { HOURLY_STAT_INTERVAL_START_BLOCK } from "@treasure/constants";

import { MagicStat, UserStat } from "../../generated/schema";
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
  getMonthlyId,
  getWeeklyId,
  getYearlyId,
} from "./ids";

export function getTimeIntervalMagicStats(block: ethereum.Block): MagicStat[] {
  const stats: MagicStat[] = [];
  const timestamp = block.timestamp.toI64() * 1000;
  const date = new Date(timestamp);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (!block.number.lt(HOURLY_STAT_INTERVAL_START_BLOCK)) {
    // Hourly
    const hourlyId = getHourlyId(timestamp);
    let hourlyStat = MagicStat.load(hourlyId);

    if (!hourlyStat) {
      hourlyStat = new MagicStat(hourlyId);

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
  let dailyStat = MagicStat.load(dailyId);

  if (!dailyStat) {
    dailyStat = new MagicStat(dailyId);

    const startOfDay = getStartOfDay(timestamp);

    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }

  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  let weeklyStat = MagicStat.load(weeklyId);

  if (!weeklyStat) {
    weeklyStat = new MagicStat(weeklyId);

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
  let monthlyStat = MagicStat.load(monthlyId);

  if (!monthlyStat) {
    monthlyStat = new MagicStat(monthlyId);

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

  let yearlyStat = MagicStat.load(yearlyId);

  if (!yearlyStat) {
    yearlyStat = new MagicStat(yearlyId);

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
  let allTimeStat = MagicStat.load(allTimeId);

  if (!allTimeStat) {
    allTimeStat = new MagicStat(allTimeId);

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
