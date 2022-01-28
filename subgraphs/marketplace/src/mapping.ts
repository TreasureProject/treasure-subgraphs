import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import { EXPLORER } from "@treasure/constants";
import { Listing, User } from "../generated/schema";
import {
  ItemCanceled,
  ItemListed,
  ItemSold,
  ItemUpdated,
} from "../generated/TreasureMarketplace/TreasureMarketplace";
import { removeIfExist } from "./helpers";

function getListing(
  seller: Address,
  contract: Address,
  tokenId: BigInt
): Listing {
  let id = `${seller.toHexString()}-${contract.toHexString()}-${tokenId.toString()}`;
  let listing = Listing.load(id);

  if (!listing) {
    listing = new Listing(id);

    listing.seller = getUser(seller).id;
    // TODO: Might be Inactive based on if it was staked or not??
    listing.status = "Active";
  }

  return listing;
}

function getUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }

  return user;
}

export function handleItemCanceled(event: ItemCanceled): void {
  let params = event.params;
  let listing = getListing(params.seller, params.nftAddress, params.tokenId);

  removeIfExist("Listing", listing.id);
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
  listing.quantity = quantity;

  listing.save();
}

export function handleItemSold(event: ItemSold): void {
  let params = event.params;
  let quantity = params.quantity;
  let seller = params.seller;
  let buyer = params.buyer;
  let address = params.nftAddress;
  let tokenId = params.tokenId;

  let listing = getListing(seller, address, tokenId);

  if (listing.quantity.equals(quantity)) {
    // Remove sold listing.
    removeIfExist("Listing", listing.id);
  } else {
    listing.quantity = listing.quantity.minus(quantity);
    listing.save();
  }

  let hash = event.transaction.hash.toHexString();
  let sold = getListing(seller, address, tokenId);

  sold.id = `${sold.id}-${hash}`;
  sold.blockTimestamp = event.block.timestamp;
  sold.buyer = getUser(buyer).id;
  sold.expires = BigInt.zero();
  sold.pricePerItem = listing.pricePerItem;
  sold.quantity = listing.quantity;
  sold.status = "Sold";
  sold.transactionLink = `https://${EXPLORER}/tx/${hash}`;

  sold.save();
}

export function handleItemUpdated(event: ItemUpdated): void {
  let params = event.params;
  let listing = getListing(params.seller, params.nftAddress, params.tokenId);

  if (!listing.pricePerItem.equals(params.pricePerItem)) {
    listing.blockTimestamp = event.block.timestamp;
  }

  listing.expires = params.expirationTime;
  listing.status = "Active";
  listing.quantity = params.quantity;
  listing.pricePerItem = params.pricePerItem;

  listing.save();
}
