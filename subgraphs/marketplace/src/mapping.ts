import { Address, BigInt, TypedMap } from "@graphprotocol/graph-ts";
import {
  Listing,
  StakedToken,
  Token,
  User,
  UserToken,
} from "../generated/schema";
import { EXPLORER } from "@treasure/constants";
import {
  ItemCanceled,
  ItemListed,
  ItemSold,
  ItemUpdated,
} from "../generated/TreasureMarketplace/TreasureMarketplace";
import {
  TransferBatch,
  TransferSingle,
} from "../generated/TreasureMarketplace/ERC1155";
import { Transfer } from "../generated/TreasureMarketplace/ERC721";
import {
  exists,
  getAddressId,
  getCollection,
  getName,
  getUserAddressId,
  removeFromArray,
  removeIfExists,
} from "./helpers";
import { DropGym, JoinGym } from "../generated/Smol Bodies Gym/Gym";
import { DropSchool, JoinSchool } from "../generated/Smol Brains School/School";

const MARKETPLACE_BUYER = Address.fromString(
  "0x812cda2181ed7c45a35a691e0c85e231d218e273"
);

let stakers = new TypedMap<string, string>();

// Smol Bodies
stakers.set(
  "0x66299ecc614b7a1920922bba7527819c841174bd",
  "0x17dacad7975960833f374622fad08b90ed67d1b5"
);

// Smol Brains
stakers.set(
  "0x602e50ed10a90d324b35930ec0f8e5d3b28cd509",
  "0x6325439389e0797ab35752b4f43a14c004f22a9c"
);

function getListing(
  seller: Address,
  contract: Address,
  tokenId: BigInt
): Listing {
  let id = getUserAddressId(seller, contract, tokenId);
  let listing = Listing.load(id);

  if (!listing) {
    listing = new Listing(id);

    listing.collection = contract.toHexString();
    listing.seller = getUser(seller).id;
    listing.status = exists("StakedToken", id) ? "Inactive" : "Active";
  }

  return listing;
}

function getToken(contract: Address, tokenId: BigInt): Token {
  let id = getAddressId(contract, tokenId);
  let token = Token.load(id);

  if (!token) {
    let collection = getCollection(contract);

    token = new Token(id);

    token.collection = collection.id;

    // TODO: Get dynamic names for Legions?
    if (collection.standard == "ERC721") {
      token.name = `${collection.name} #${tokenId.toString()}`;
    } else {
      token.name = getName(tokenId);
    }

    token.tokenId = tokenId;
    token.save();
  }

  return token;
}

function getStakedTokenId(
  user: Address,
  contract: Address,
  tokenId: BigInt
): string {
  let token = stakers.get(contract.toHexString());
  let id = getUserAddressId(
    user,
    token ? Address.fromString(token) : contract,
    tokenId
  );

  return id;
}

function getUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }

  return user;
}

function handleStake(user: Address, contract: Address, tokenId: BigInt): void {
  let id = getStakedTokenId(user, contract, tokenId);
  let stakedToken = StakedToken.load(id);

  if (!stakedToken) {
    stakedToken = new StakedToken(id);

    let token = stakers.get(contract.toHexString());

    // TODO: Is it necessary? Or will it be ok to just use the staked token id
    if (token) {
      let tokenAddress = Address.fromString(token);

      stakedToken.token = getAddressId(tokenAddress, tokenId);

      // TODO: Handle ERC1155s?
      let listing = Listing.load(getUserAddressId(user, tokenAddress, tokenId));

      if (listing) {
        listing.status = "Inactive";
        listing.save();

        updateCollectionFloorAndTotal(listing.collection);
      }
    }

    stakedToken.user = user.toHexString();
  }

  // TODO: Support multiple for ERC1155s
  stakedToken.quantity = stakedToken.quantity + 1;
  stakedToken.save();
}

function handleUnstake(
  user: Address,
  contract: Address,
  tokenId: BigInt
): void {
  // TODO: Handle ERC1155s with multiple quantities
  removeIfExists("StakedToken", getStakedTokenId(user, contract, tokenId));
}

/**
 * This is a generic function that can handle both ERC1155s and ERC721s
 */
// TODO: Handle staking contracts and bridgeworld staking
function handleTransfer(
  contract: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  quantity: i32
): void {
  let user = getUser(to);
  let token = getToken(contract, tokenId);

  let listing = Listing.load(getUserAddressId(from, contract, tokenId));

  if (listing) {
    listing.status = "Inactive";
    listing.save();

    updateCollectionFloorAndTotal(listing.collection);
  }

  let fromUserToken = UserToken.load(`${from.toHexString()}-${token.id}`);

  if (fromUserToken) {
    fromUserToken.quantity = fromUserToken.quantity - quantity;
    fromUserToken.save();

    if (fromUserToken.quantity == 0) {
      removeIfExists("UserToken", fromUserToken.id);
    }
  }

  let id = `${user.id}-${token.id}`;
  let toUserToken = UserToken.load(id);

  if (!toUserToken) {
    toUserToken = new UserToken(id);

    toUserToken.token = token.id;
    toUserToken.user = user.id;
  }

  toUserToken.quantity = toUserToken.quantity + quantity;
  toUserToken.save();
}

function updateCollectionFloorAndTotal(id: string): void {
  let collection = getCollection(Address.fromString(id));
  let floorPrices = new TypedMap<string, BigInt>();
  let listings = collection.listings;
  let length = listings.length;

  collection.floorPrice = BigInt.zero();
  collection.totalListings = 0;

  for (let index = 0; index < length; index++) {
    let id = listings[index];
    let listing = Listing.load(id);

    if (!listing) {
      collection.listings = removeFromArray(listings, id);
    } else {
      if (listing.status == "Active") {
        let floorPrice = collection.floorPrice;
        let pricePerItem = listing.pricePerItem;

        if (collection.standard == "ERC1155") {
          let tokenFloorPrice = floorPrices.get(listing.token);

          if (
            !tokenFloorPrice ||
            (tokenFloorPrice && tokenFloorPrice.gt(pricePerItem))
          ) {
            floorPrices.set(listing.token, pricePerItem);
          }
        }

        if (floorPrice.isZero() || floorPrice.gt(pricePerItem)) {
          collection.floorPrice = pricePerItem;
        }

        collection.totalListings += listing.quantity;
      }
    }
  }

  let entries = floorPrices.entries;

  for (let index = 0; index < entries.length; index++) {
    let entry = entries[index];
    let token = Token.load(entry.key);

    if (token) {
      token.floorPrice = entry.value;
      token.save();
    }
  }

  collection.save();
}

export function handleItemCanceled(event: ItemCanceled): void {
  let params = event.params;
  let address = params.nftAddress;
  let listing = getListing(params.seller, address, params.tokenId);

  removeIfExists("Listing", listing.id);

  updateCollectionFloorAndTotal(listing.collection);
}

export function handleItemListed(event: ItemListed): void {
  let params = event.params;
  let pricePerItem = params.pricePerItem;
  let quantity = params.quantity;
  let tokenAddress = params.nftAddress;
  let tokenId = params.tokenId;
  let seller = params.seller;

  let listing = getListing(seller, tokenAddress, tokenId);

  listing.blockTimestamp = event.block.timestamp;
  listing.expires = params.expirationTime;
  listing.pricePerItem = pricePerItem;
  listing.quantity = quantity.toI32();
  listing.token = getAddressId(tokenAddress, tokenId);

  listing.save();

  let collection = getCollection(tokenAddress);

  collection.listings = collection.listings.concat([listing.id]);
  collection.save();

  updateCollectionFloorAndTotal(collection.id);
}

export function handleItemSold(event: ItemSold): void {
  let params = event.params;
  let quantity = params.quantity.toI32();
  let seller = params.seller;
  let address = params.nftAddress;
  let tokenId = params.tokenId;
  let buyer = params.buyer.equals(MARKETPLACE_BUYER)
    ? event.transaction.from
    : params.buyer;

  let listing = getListing(seller, address, tokenId);

  listing.quantity = listing.quantity - quantity;

  if (listing.quantity == 0) {
    // Remove sold listing.
    removeIfExists("Listing", listing.id);
  } else {
    listing.save();
  }

  let hash = event.transaction.hash.toHexString();
  let sold = getListing(seller, address, tokenId);

  sold.id = `${sold.id}-${hash}`;
  sold.blockTimestamp = event.block.timestamp;
  sold.buyer = getUser(buyer).id;
  sold.collection = listing.collection;
  sold.expires = BigInt.zero();
  sold.pricePerItem = listing.pricePerItem;
  sold.quantity = quantity;
  sold.status = "Sold";
  sold.transactionLink = `https://${EXPLORER}/tx/${hash}`;
  sold.token = listing.token;

  sold.save();

  let collection = getCollection(address);

  collection.totalSales = collection.totalSales.plus(BigInt.fromI32(1));
  collection.totalVolume = collection.totalVolume.plus(
    listing.pricePerItem.times(BigInt.fromI32(quantity))
  );

  // TODO: Not sure if this is needeed, but put it in for now.
  if (listing.quantity == 0) {
    collection.listings = removeFromArray(collection.listings, listing.id);
  }

  collection.save();

  updateCollectionFloorAndTotal(collection.id);
}

export function handleItemUpdated(event: ItemUpdated): void {
  let params = event.params;
  let listing = getListing(params.seller, params.nftAddress, params.tokenId);

  if (!listing.pricePerItem.equals(params.pricePerItem)) {
    listing.blockTimestamp = event.block.timestamp;
  }

  listing.expires = params.expirationTime;
  listing.status = exists("StakedToken", listing.id) ? "Inactive" : "Active";
  listing.quantity = params.quantity.toI32();
  listing.pricePerItem = params.pricePerItem;

  listing.save();

  updateCollectionFloorAndTotal(listing.collection);
}

export function handleTransfer721(event: Transfer): void {
  let params = event.params;

  handleTransfer(event.address, params.from, params.to, params.tokenId, 1);
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;
  let ids = params.ids;
  let amounts = params.values;
  let length = ids.length;

  for (let index = 0; index < length; index++) {
    handleTransfer(
      event.address,
      params.from,
      params.to,
      ids[index],
      amounts[index].toI32()
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value.toI32()
  );
}

// Smol Bodies

export function handleDropGym(event: DropGym): void {
  handleUnstake(event.transaction.from, event.address, event.params.tokenId);
}

export function handleJoinGym(event: JoinGym): void {
  handleStake(event.transaction.from, event.address, event.params.tokenId);
}

// Smol Brains

export function handleDropSchool(event: DropSchool): void {
  handleUnstake(event.transaction.from, event.address, event.params.tokenId);
}

export function handleJoinSchool(event: JoinSchool): void {
  handleStake(event.transaction.from, event.address, event.params.tokenId);
}
