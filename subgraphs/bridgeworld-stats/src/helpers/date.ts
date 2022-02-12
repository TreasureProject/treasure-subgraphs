export const SECONDS_IN_HOUR = 60 * 60;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;

function isLeapYear(year: i32): bool {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

export function getDaysInMonth(month: i32, year: i32): i32 {
  if (month == 1) {
    return isLeapYear(year) ? 29 : 28;
  }

  if ([1, 3, 5, 8, 10].includes(month)) {
    return 30;
  }

  return 31;
}

export function getDaysInYear(year: i32): i32 {
  return isLeapYear(year) ? 366 : 365;
}

export function getStartOfHour(timestamp: i64): i64 {
  const date = new Date(timestamp);
  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  return(date.getTime() / 1000) as i64;
}

export function getStartOfDay(timestamp: i64): i64 {
  const date = new Date(timestamp);
  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  return(date.getTime() / 1000) as i64;
}

export function getStartOfWeek(timestamp: i64): i64 {
  const date = new Date(timestamp);
  const sundayDate = new Date(timestamp - (date.getUTCDay() * SECONDS_IN_DAY * 1000));
  sundayDate.setUTCMilliseconds(0);
  sundayDate.setUTCSeconds(0);
  sundayDate.setUTCMinutes(0);
  sundayDate.setUTCHours(0);
  return(sundayDate.getTime() / 1000) as i64;
}

export function getStartOfMonth(timestamp: i64): i64 {
  const date = new Date(timestamp);
  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCDate(1);
  return(date.getTime() / 1000) as i64;
}

export function getStartOfYear(timestamp: i64): i64 {
  const date = new Date(timestamp);
  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCDate(1);
  date.setUTCMonth(0);
  return(date.getTime() / 1000) as i64;
}
