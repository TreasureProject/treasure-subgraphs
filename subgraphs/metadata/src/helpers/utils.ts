import { Address, store } from "@graphprotocol/graph-ts";

export function exists(entity: string, id: string): boolean {
  return store.get(entity, id) != null;
}

export function isMint(address: Address): boolean {
  return address.equals(Address.zero());
}
