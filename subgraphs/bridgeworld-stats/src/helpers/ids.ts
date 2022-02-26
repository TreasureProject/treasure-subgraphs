import { BigInt } from "@graphprotocol/graph-ts";

import {
  CRAFTING_ADDRESS,
  LEGION_ADDRESS,
  QUESTING_ADDRESS,
} from "@treasure/constants";

import { SECONDS_IN_DAY } from "./date";
import { toPaddedString } from "./number";

export function getHourlyId(timestamp: i64): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const mm = toPaddedString(date.getUTCMonth() + 1);
  const dd = toPaddedString(date.getUTCDate());
  const hhmm = `${toPaddedString(date.getUTCHours())}00`;
  return `${year}${mm}${dd}-${hhmm}-hourly`;
}

export function getDailyId(timestamp: i64): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const mm = toPaddedString(date.getUTCMonth() + 1);
  const dd = toPaddedString(date.getUTCDate());
  return `${year}${mm}${dd}-daily`;
}

export function getWeeklyId(timestamp: i64): string {
  const date = new Date(timestamp);
  const sundayDate = new Date(
    timestamp - date.getUTCDay() * SECONDS_IN_DAY * 1000
  );
  const year = sundayDate.getUTCFullYear();
  const mm = toPaddedString(sundayDate.getUTCMonth() + 1);
  const dd = toPaddedString(sundayDate.getUTCDate());
  return `${year}${mm}${dd}-weekly`;
}

export function getMonthlyId(timestamp: i64): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const mm = toPaddedString(date.getUTCMonth() + 1);
  return `${year}${mm}-monthly`;
}

export function getYearlyId(timestamp: i64): string {
  const year = new Date(timestamp).getUTCFullYear();
  return `${year}-yearly`;
}

export function getAllTimeId(): string {
  return "all-time";
}

export function getCraftId(tokenId: BigInt): string {
  return `${CRAFTING_ADDRESS.toHexString()}-${tokenId.toHexString()}`;
}

export function getLegionId(tokenId: BigInt): string {
  return `${LEGION_ADDRESS.toHexString()}-${tokenId.toHexString()}`;
}

export function getQuestId(tokenId: BigInt): string {
  return `${QUESTING_ADDRESS.toHexString()}-${tokenId.toHexString()}`;
}
