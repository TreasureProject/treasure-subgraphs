export function toBigIntString(value: number): string {
  return `${value * 1e18}`.replace(".0", "");
}
