import { Address, BigInt, store } from "@graphprotocol/graph-ts";

export function getAddressId(address: Address, tokenId: BigInt): string {
  return `${address.toHexString()}-${tokenId.toHexString()}`;
}

export function isMint(address: Address): boolean {
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

export function removeIfExist(entity: string, id: string): void {
  if (store.get(entity, id)) {
    store.remove(entity, id);
  }
}
