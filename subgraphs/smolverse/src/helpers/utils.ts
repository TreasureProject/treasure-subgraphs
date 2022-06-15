import { Address } from "@graphprotocol/graph-ts";

export function isZero(address: Address): bool {
  return address.equals(Address.zero());
}
