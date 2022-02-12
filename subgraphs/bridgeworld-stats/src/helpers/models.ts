import { Address, BigInt } from "@graphprotocol/graph-ts";

import { AtlasMineLockStat, AtlasMineStat, User } from "../../generated/schema";
import {
  getDaysInMonth,
  getDaysInYear,
  getStartOfDay,
  getStartOfHour,
  getStartOfMonth,
  getStartOfYear,
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR
} from "./date";
import {
  getAllTimeId,
  getDailyId,
  getHourlyId,
  getMonthlyId,
  getYearlyId
} from "./ids";

export function getOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.magicDepositCount = 0;
    user.magicWithdrawCount = 0;
    user.magicHarvestCount = 0;
    user.magicDeposited = BigInt.fromI32(0);
    user.magicWithdrawn = BigInt.fromI32(0);
    user.magicHarvested = BigInt.fromI32(0);
    user.save();
  }

  return user;
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

  // TODO: Weekly

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
    monthlyStat,
    yearlyStat,
    allTimeStat
  ];
}

export function createAtlasMineStat(id: string): AtlasMineStat {
  const stat = new AtlasMineStat(id);
  stat._activeAddresses = [];
  stat.magicDepositCount = 0;
  stat.magicWithdrawCount = 0;
  stat.magicHarvestCount = 0;
  stat.magicDeposited = BigInt.fromI32(0);
  stat.magicWithdrawn = BigInt.fromI32(0);
  stat.magicHarvested = BigInt.fromI32(0);
  stat.activeAddressesCount = 0;
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
    lockStat.magicDeposited = BigInt.fromI32(0);
    lockStat.save();
  }

  return lockStat;
}
