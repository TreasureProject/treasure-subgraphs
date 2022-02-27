import { Collection, Token } from "../../generated/schema";
import { Address, BigInt, log, TypedMap } from "@graphprotocol/graph-ts";
import {
    SEED_OF_LIFE_ADDRESS,
    SEED_OF_LIFE_ITEM_ADDRESS,
    IMBUED_SOUL_ADDRESS,
    BALANCER_CRYSTAL_ADDRESS,
    SEED_OF_LIFE_TREASURES_ADDRESS
} from "../../../../packages/constants/src/index.template";

import {
    SEED_OF_LIFE_NAME,
    SEED_OF_LIFE_ITEMS_NAME,
    IMBUED_SOUL_NAME,
    BALANCER_CRYSTAL_NAME,
    TREASURES_NAME
} from "./constants";

const collections = new TypedMap<Address, string>();
collections.set(SEED_OF_LIFE_ADDRESS, SEED_OF_LIFE_NAME);
collections.set(SEED_OF_LIFE_ITEM_ADDRESS, SEED_OF_LIFE_ITEMS_NAME);
collections.set(IMBUED_SOUL_ADDRESS, IMBUED_SOUL_NAME);
collections.set(BALANCER_CRYSTAL_ADDRESS, BALANCER_CRYSTAL_NAME);
collections.set(SEED_OF_LIFE_TREASURES_ADDRESS, TREASURES_NAME);

export class CollectionHelpers {

    public static getNameForCollection(address: Address): string {
        const nameEntry = collections.getEntry(address);
        if (!nameEntry) {
            log.warning("[collections] Unknown collection name: {}", [address.toHexString()]);
            return "Unknown";
        }

        return nameEntry.value;
    }

    public static getOrCreateCollection(address: Address,): Collection {
        const id = CollectionHelpers.getCollectionId(address);
        let collection = Collection.load(id);

        if (!collection) {
            collection = new Collection(id);
            collection.name = CollectionHelpers.getNameForCollection(address);
            collection.save();
        }

        return collection;
    }

    public static getCollectionId(address: Address): string {
        return address.toHexString();
    }

}