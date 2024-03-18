import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export const getAddressId = (address: Address, tokenId: BigInt): Bytes =>
  address.concatI32(tokenId.toI32());

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
