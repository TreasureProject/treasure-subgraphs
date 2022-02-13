export function toPaddedString(number: i32): string {
  if (number < 10) {
    return `0${number}`;
  }

  return number.toString();
}
