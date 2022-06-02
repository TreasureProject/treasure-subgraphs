import {
  Address,
  BigInt,
  TypedMap,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";

import {
  EXPLORER,
  MARKETPLACE_ADDRESS,
  MARKETPLACE_BUYER_ADDRESS,
  MARKETPLACE_V2_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import { DropGym, JoinGym } from "../generated/Smol Bodies Gym/Gym";
import { DropSchool, JoinSchool } from "../generated/Smol Brains School/School";
import { UpdateCollectionOwnerFee } from "../generated/TreasureMarketplace v2/Marketplace";
import { Transfer } from "../generated/TreasureMarketplace/ERC721";
import {
  TransferBatch,
  TransferSingle,
} from "../generated/TreasureMarketplace/ERC1155";
import {
  Staked,
  Unstaked,
} from "../generated/TreasureMarketplace/NonEscrowStaking";
import {
  ItemCanceled,
  ItemListed,
  ItemSold,
  ItemUpdated,
  UpdateOracle,
} from "../generated/TreasureMarketplace/TreasureMarketplace";
import {
  Collection,
  Fee,
  Listing,
  StakedToken,
  Token,
  UserToken,
} from "../generated/schema";
import {
  exists,
  getAddressId,
  getAllCollections,
  getCollection,
  getStats,
  getToken,
  getUser,
  getUserAddressId,
  isPaused,
  isZero,
  removeFromArray,
  removeIfExists,
} from "./helpers";

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

// Tales of Elleria
stakers.set(
  "0xc985872c155c387c850aa9cc6b19e81a35ccd829",
  "0x7480224ec2b98f28cee3740c80940a2f489bf352"
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

    listing.seller = getUser(seller).id;
    listing.token = getAddressId(contract, tokenId);
  }

  return listing;
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

function handleStake(
  user: Address,
  contract: Address,
  tokenId: BigInt,
  timestamp: i64
): void {
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

        updateCollectionFloorAndTotal(listing.collection, timestamp);
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
  operator: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  quantity: i32,
  timestamp: i64
): void {
  let user = getUser(to);
  let token = getToken(contract, tokenId);
  let isMarketplace = [
    MARKETPLACE_ADDRESS.toHexString(),
    MARKETPLACE_BUYER_ADDRESS.toHexString(),
    MARKETPLACE_V2_ADDRESS.toHexString(),
  ].includes(operator.toHexString());

  if (!isMarketplace) {
    let listing = Listing.load(getUserAddressId(from, contract, tokenId));

    if (listing) {
      listing.status = "Inactive";
      listing.save();

      updateCollectionFloorAndTotal(listing.collection, timestamp);
    }
  }

  if (isZero(from)) {
    let collection = Collection.load(token.collection);

    // Will be null from legions collection
    if (collection != null) {
      if (collection.standard == "ERC1155") {
        let stats = getStats(token.id);

        stats.items += quantity;
        stats.save();
      }

      let stats = getStats(collection.id);

      stats.items += quantity;
      stats.save();
    }
  }

  let fromUserToken = UserToken.load(`${from.toHexString()}-${token.id}`);

  if (fromUserToken) {
    fromUserToken.quantity -= quantity;
    fromUserToken.save();

    if (fromUserToken.quantity == 0) {
      removeIfExists("UserToken", fromUserToken.id);
    }
  }

  if (isZero(to)) {
    let collection = Collection.load(token.collection);

    // Will be null from legions collection
    if (collection != null) {
      if (collection.standard == "ERC1155") {
        let stats = getStats(token.id);

        stats.burned += quantity;
        stats.items -= quantity;
        stats.save();
      } else {
        removeIfExists("Token", token.id);
      }

      let stats = getStats(collection.id);

      stats.burned += quantity;
      stats.items -= quantity;
      stats.save();
    }

    removeIfExists("User", Address.zero().toHexString());

    return;
  }

  let id = `${user.id}-${token.id}`;
  let toUserToken = UserToken.load(id);

  if (!toUserToken) {
    toUserToken = new UserToken(id);

    toUserToken.collection = token.collection;
    toUserToken.token = token.id;
    toUserToken.user = user.id;
  }

  toUserToken.quantity += quantity;
  toUserToken.save();
}

function updateCollectionFloorAndTotal(id: string, timestamp: i64): void {
  let collection = getCollection(id);
  let floorPrices = new TypedMap<string, BigInt>();
  let tokenListings = new Map<string, number>();
  let listings = collection.listings;
  let length = listings.length;
  let stats = getStats(id);

  collection.floorPrice = stats.floorPrice = BigInt.zero();
  collection.totalListings = stats.listings = 0;

  for (let index = 0; index < length; index++) {
    let id = listings[index];
    let listing = Listing.load(id);

    if (!listing) {
      collection.listings = removeFromArray(listings, id);
    } else {
      if (listing.status == "Active") {
        let floorPrice = collection.floorPrice;
        let pricePerItem = listing.pricePerItem;

        // Check to see if we need to expire the listing
        if (listing.expires.lt(BigInt.fromI64(timestamp))) {
          listing.status = "Expired";
          listing.save();

          continue;
        }

        if (collection.standard == "ERC1155") {
          let tokenFloorPrice = floorPrices.get(listing.token);
          let currentTokenListings = tokenListings.has(listing.token)
            ? tokenListings.get(listing.token)
            : 0;

          tokenListings.set(
            listing.token,
            (currentTokenListings += listing.quantity)
          );

          if (
            !tokenFloorPrice ||
            (tokenFloorPrice && tokenFloorPrice.gt(pricePerItem))
          ) {
            floorPrices.set(listing.token, pricePerItem);
          }
        }

        if (floorPrice.isZero() || floorPrice.gt(pricePerItem)) {
          collection.floorPrice = stats.floorPrice = pricePerItem;
        }

        collection.totalListings = stats.listings += listing.quantity;
      }
    }
  }

  let entries = floorPrices.entries;

  for (let index = 0; index < entries.length; index++) {
    let entry = entries[index];
    let token = Token.load(entry.key);
    let stats = getStats(entry.key);

    stats.floorPrice = entry.value;
    stats.save();

    if (token) {
      token.floorPrice = entry.value;
      token.save();
    }
  }

  let keys = tokenListings.keys();

  for (let index = 0; index < keys.length; index++) {
    let key = keys[index];
    let stats = getStats(key);

    stats.listings = tokenListings.get(key) as i32;
    stats.save();
  }

  collection.save();
  stats.save();
}

function normalizeTime(value: BigInt): BigInt {
  return value.toString().length == 10
    ? value.times(BigInt.fromI32(1000))
    : value;
}

function getTime(event: ethereum.Event): i64 {
  return event.block.timestamp.toI64() * 1000;
}

export function handleItemCanceled(event: ItemCanceled): void {
  // Do nothing if paused
  if (isPaused(event)) {
    return;
  }

  let params = event.params;
  let address = params.nftAddress;
  let listing = getListing(params.seller, address, params.tokenId);

  // Was invalid listing, likely a Recruit.
  if (listing.quantity == 0) {
    return;
  }

  removeIfExists("Listing", listing.id);

  let collection = getCollection(listing.collection);

  // Update ERC1155 stats
  if (collection.standard == "ERC1155") {
    let stats = getStats(listing.token);

    // Last listing was removed. Clear floor price.
    if (stats.listings == listing.quantity) {
      stats.floorPrice = BigInt.zero();
      stats.listings = 0;
    }

    stats.save();
  }

  updateCollectionFloorAndTotal(listing.collection, getTime(event));
}

export function handleItemListed(event: ItemListed): void {
  // Do nothing if paused
  if (isPaused(event)) {
    return;
  }

  let params = event.params;
  let pricePerItem = params.pricePerItem;
  let quantity = params.quantity;
  let tokenAddress = params.nftAddress;
  let tokenId = params.tokenId;
  let seller = params.seller;

  let token = getToken(tokenAddress, tokenId);
  let collection = getCollection(token.collection);

  if (collection.standard == "") {
    return;
  }

  // We don't allow listing Recruits on the marketplace
  if (token.name == "Recruit") {
    return;
  }

  let listing = getListing(seller, tokenAddress, tokenId);

  listing.blockTimestamp = event.block.timestamp;
  listing.collection = token.collection;
  listing.expires = normalizeTime(params.expirationTime);
  listing.pricePerItem = pricePerItem;
  listing.quantity = quantity.toI32();
  listing.status = exists("StakedToken", listing.id) ? "Inactive" : "Active";

  listing.save();

  if (collection.listings.indexOf(listing.id) == -1) {
    collection.listings = collection.listings.concat([listing.id]);
    collection.save();
  }

  updateCollectionFloorAndTotal(collection.id, getTime(event));
}

export function handleItemSold(event: ItemSold): void {
  let params = event.params;
  let quantity = params.quantity.toI32();
  let seller = params.seller;
  let address = params.nftAddress;
  let tokenId = params.tokenId;
  let buyer = params.buyer.equals(MARKETPLACE_BUYER_ADDRESS)
    ? event.transaction.from
    : params.buyer;

  let listing = getListing(seller, address, tokenId);

  // Was invalid listing, likely a Recruit. Should never happen as contract would revert the transfer anyways.
  if (listing.quantity == 0) {
    return;
  }

  listing.quantity = listing.quantity - quantity;

  if (listing.quantity == 0 || quantity == 0) {
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
  sold.status = quantity == 0 ? "Invalid" : "Sold";
  sold.transactionLink = `https://${EXPLORER}/tx/${hash}`;
  sold.token = listing.token;

  sold.save();

  let collection = getCollection(listing.collection);
  let stats = getStats(collection.stats);

  collection.totalSales = collection.totalSales.plus(
    BigInt.fromI32(quantity == 0 ? 0 : 1)
  );
  collection.totalVolume = stats.volume = collection.totalVolume.plus(
    listing.pricePerItem.times(BigInt.fromI32(quantity))
  );

  stats.sales = collection.totalSales.toI32();

  // TODO: Not sure if this is needed, but put it in for now.
  if (listing.quantity == 0 || quantity == 0) {
    collection.listings = removeFromArray(collection.listings, listing.id);
  }

  collection.save();
  stats.save();

  // Update ERC1155 stats
  if (collection.standard == "ERC1155") {
    let stats = getStats(listing.token);

    stats.sales += 1;
    stats.volume = stats.volume.plus(
      listing.pricePerItem.times(BigInt.fromI32(quantity))
    );

    // Last listing was removed. Clear floor price.
    if (stats.listings == quantity) {
      stats.floorPrice = BigInt.zero();
      stats.listings = 0;
    }

    stats.save();
  }

  updateCollectionFloorAndTotal(collection.id, getTime(event));
}

export function handleItemUpdated(event: ItemUpdated): void {
  // Do nothing if paused
  if (isPaused(event)) {
    return;
  }

  let params = event.params;
  let listing = getListing(params.seller, params.nftAddress, params.tokenId);

  // Was invalid listing, likely a Recruit
  if (listing.quantity == 0) {
    return;
  }

  if (!listing.pricePerItem.equals(params.pricePerItem)) {
    listing.blockTimestamp = event.block.timestamp;
  }

  listing.expires = normalizeTime(params.expirationTime);
  listing.status = exists("StakedToken", listing.id) ? "Inactive" : "Active";
  listing.quantity = params.quantity.toI32();
  listing.pricePerItem = params.pricePerItem;

  // Bug existed in contract that allowed quantity to be updated to 0, but then couldn't be sold.
  // Remove this listing as it is invalid.
  if (listing.quantity == 0) {
    store.remove("Listing", listing.id);
  } else {
    listing.save();
  }

  updateCollectionFloorAndTotal(listing.collection, getTime(event));
}

export function handleOracleUpdate(event: UpdateOracle): void {
  // Safety first
  if (event.params.oracle.notEqual(Address.zero())) {
    return;
  }

  // Cancel all listings.
  let collections = getAllCollections();
  let length = collections.length;

  for (let index = 0; index < length; index++) {
    let id = collections[index];

    // Should never happen, but cleans up warnings in test.
    if (!exists("Collection", id)) {
      continue;
    }

    let collection = getCollection(id);

    let listings = collection.listings.filter(
      (item) => item.split("-").length == 3
    );
    let innerLength = listings.length;

    for (let innerIndex = 0; innerIndex < innerLength; innerIndex++) {
      store.remove("Listing", listings[innerIndex]);
    }

    let stats = getStats(id);

    collection.floorPrice = stats.floorPrice = BigInt.zero();
    collection.listings = [];
    collection.totalListings = stats.listings = 0;

    collection.save();
    stats.save();

    if (collection.standard == "ERC1155") {
      for (let tokenIndex = 1; tokenIndex < 165; tokenIndex++) {
        let tokenId = `${collection.id}-0x${tokenIndex.toString(16)}`;

        if (exists("Token", tokenId)) {
          let token = Token.load(tokenId);

          if (!token) {
            continue;
          }

          let stats = getStats(tokenId);

          token.floorPrice = stats.floorPrice = BigInt.zero();
          token.save();

          stats.listings = 0;
          stats.save();
        }
      }
    }
  }
}

export function handleUpdateCollectionOwnerFee(
  event: UpdateCollectionOwnerFee
): void {
  const params = event.params;
  const id = params.collection.toHexString();

  let fee = Fee.load(id);

  if (!fee) {
    fee = new Fee(id);

    fee.collection = id;
  }

  fee.fee = params.fee
    .divDecimal(BigInt.fromI32(10_000).toBigDecimal())
    .toString();
  fee.save();
}

export function handleTransfer721(event: Transfer): void {
  let params = event.params;

  handleTransfer(
    event.address,
    Address.zero(),
    params.from,
    params.to,
    params.tokenId,
    1,
    getTime(event)
  );
}

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;
  let ids = params.ids;
  let amounts = params.values;
  let length = ids.length;

  for (let index = 0; index < length; index++) {
    let id = ids[index];

    if (event.address.equals(TREASURE_ADDRESS) && id.isZero()) {
      continue;
    }

    handleTransfer(
      event.address,
      params.operator,
      params.from,
      params.to,
      id,
      amounts[index].toI32(),
      getTime(event)
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;

  if (event.address.equals(TREASURE_ADDRESS) && params.id.isZero()) {
    return;
  }

  handleTransfer(
    event.address,
    params.operator,
    params.from,
    params.to,
    params.id,
    params.value.toI32(),
    getTime(event)
  );
}

// Smol Bodies

export function handleDropGym(event: DropGym): void {
  handleUnstake(event.transaction.from, event.address, event.params.tokenId);
}

export function handleJoinGym(event: JoinGym): void {
  handleStake(
    event.transaction.from,
    event.address,
    event.params.tokenId,
    getTime(event)
  );
}

// Smol Brains

export function handleDropSchool(event: DropSchool): void {
  handleUnstake(event.transaction.from, event.address, event.params.tokenId);
}

export function handleJoinSchool(event: JoinSchool): void {
  handleStake(
    event.transaction.from,
    event.address,
    event.params.tokenId,
    getTime(event)
  );
}

// Tales of Elleria/Generic

export function handleStake721(event: Staked): void {
  handleStake(
    event.transaction.from,
    event.address,
    event.params.tokenId,
    getTime(event)
  );
}

export function handleUnstake721(event: Unstaked): void {
  handleUnstake(event.transaction.from, event.address, event.params.tokenId);
}
