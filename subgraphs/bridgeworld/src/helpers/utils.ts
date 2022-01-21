import { Address } from "@graphprotocol/graph-ts";

export function isMint(address: Address): boolean {
  return address.equals(Address.zero());
}

// @ts-ignore - i32 is correct
function removeAtIndex<T>(array: T[], index: i32): T[] {
  return index == -1
    ? array
    : array.slice(0, index).concat(array.slice(index + 1));
}

export function removeFromArray<T>(array: T[], item: T): T[] {
  return removeAtIndex(array, array.indexOf(item));
}
