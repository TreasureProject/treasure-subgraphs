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
