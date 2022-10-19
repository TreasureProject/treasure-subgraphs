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
    const hourlyStat = getOrCreateMagicStat(hourlyId);

    if (hourlyStat.interval == "") {
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
  const dailyStat = getOrCreateMagicStat(dailyId);

  if (dailyStat.interval == "") {
    const startOfDay = getStartOfDay(timestamp);

    dailyStat.interval = "Daily";
    dailyStat.startTimestamp = BigInt.fromI64(startOfDay);
    dailyStat.endTimestamp = BigInt.fromI64(startOfDay + SECONDS_IN_DAY - 1);
    dailyStat.save();
  }

  stats.push(dailyStat);

  // Weekly
  const weeklyId = getWeeklyId(timestamp);
  const weeklyStat = getOrCreateMagicStat(weeklyId);

  if (weeklyStat.interval == "") {
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
  const monthlyStat = getOrCreateMagicStat(monthlyId);

  if (monthlyStat.interval == "") {
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
  const yearlyStat = getOrCreateMagicStat(yearlyId);

  if (yearlyStat.interval == "") {
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
  const allTimeStat = getOrCreateMagicStat(allTimeId);

  if (allTimeStat.interval == "") {
    allTimeStat.interval = "AllTime";
    allTimeStat.save();
  }

  stats.push(allTimeStat);

  return stats;
}

function getOrCreateMagicStat(statId: string): MagicStat {
  let stat = MagicStat.load(statId);

  if (!stat) {
    stat = new MagicStat(statId);

    stat.allAddressesCount = 0;
    stat.interval = "";
    stat.magicTransferred = BigInt.zero();
    stat.magicTransferredCount = 0;
  }

  return stat;
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
    stat.magicReceivedCount = 0;
    stat.magicSentCount = 0;
    stat.magicReceived = BigInt.zero();
    stat.magicSent = BigInt.zero();
    stat.save();
  }

  return stat;
}
