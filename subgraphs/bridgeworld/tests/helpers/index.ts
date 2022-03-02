export * from "./atlas-mine";
export * from "./constants";
export * from "./crafting";
export * from "./legion";
export * from "./magic";
export * from "./pilgrimage";
export * from "./questing";
export * from "./randomizer";
export * from "./summoning";
export * from "./treasure";

export function toBigIntString(value: number): string {
  return `${value * 1e18}`.replace(".0", "");
}
