import { Address } from "@graphprotocol/graph-ts";

export function isMint(address: Address): bool {
  return address.equals(Address.zero());
}
