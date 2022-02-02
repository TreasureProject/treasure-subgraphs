import { Address, log } from "@graphprotocol/graph-ts";
import { Collection } from "../../generated/schema";

function createCollection(
  contract: Address,
  name: string,
  standard: string
): void {
  let id = contract.toHexString();
  let collection = Collection.load(id);

  if (!collection) {
    collection = new Collection(id);

    collection.contract = id;
    collection.listings = [];
    collection.name = name;
    collection.standard = standard;

    collection.save();
  }
}

export function createErc721Collection(contract: Address, name: string): void {
  createCollection(contract, name, "ERC721");
}

export function createErc1155Collection(contract: Address, name: string): void {
  createCollection(contract, name, "ERC1155");
}

export function getCollection(contract: Address): Collection {
  let id = contract.toHexString();
  let collection = Collection.load(id);

  // Should never happen, famous last words
  if (!collection) {
    collection = new Collection(id);

    log.warning("Unknown collection: {}", [contract.toHexString()]);
  }

  return collection;
}
