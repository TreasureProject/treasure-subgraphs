import { Address } from "@graphprotocol/graph-ts";

export function isMint(address: Address): boolean {
  return address.equals(Address.zero());
}
