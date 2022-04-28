import { Address, store } from "@graphprotocol/graph-ts";

export function exists(entity: string, id: string): boolean {
  return store.get(entity, id) != null;
}

export function isZero(address: Address): boolean {
  return address.equals(Address.zero());
}

function removeAtIndex<T>(array: T[], index: i32): T[] {
  return index == -1
    ? array
    : array.slice(0, index).concat(array.slice(index + 1));
}

export function removeFromArray<T>(array: T[], item: T): T[] {
  return removeAtIndex(array, array.indexOf(item));
}

export function removeIfExists(entity: string, id: string): void {
  if (exists(entity, id)) {
    store.remove(entity, id);
  }
}
