import { Address, BigInt } from "@graphprotocol/graph-ts";

export function getAddressId(address: Address, tokenId: BigInt): string {
  return `${address.toHexString()}-${tokenId.toHexString()}`;
}

export function getUserAddressId(
  user: Address,
  address: Address,
  tokenId: BigInt
): string {
  return [user.toHexString(), getAddressId(address, tokenId)].join("-");
}
