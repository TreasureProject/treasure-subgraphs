import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export const getAddressId = (address: Address, tokenId: BigInt): Bytes =>
  address.concatI32(tokenId.toI32());

export function isMint(address: Address): boolean {
  return address.equals(Address.zero());
}
