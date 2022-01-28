import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";
import { EXPLORER } from "@treasure/constants";
import {
  ItemCanceled,
  ItemListed,
  ItemSold,
  ItemUpdated,
} from "../generated/TreasureMarketplace/TreasureMarketplace";
import { Listing, Token, User, UserToken } from "../generated/schema";
import {
  TransferBatch,
  TransferSingle,
} from "../generated/TreasureMarketplace/ERC1155";
import { removeIfExist } from "./helpers";

export function getAddressId(address: Address, tokenId: BigInt): string {
  return `${address.toHexString()}-${tokenId.toHexString()}`;
}

function getListingId(
  seller: Address,
  contract: Address,
  tokenId: BigInt
): string {
  return [
    seller.toHexString(),
    contract.toHexString(),
    tokenId.toString(),
  ].join("-");
}

function getListing(
  seller: Address,
  contract: Address,
  tokenId: BigInt
): Listing {
  let id = getListingId(seller, contract, tokenId);
  let listing = Listing.load(id);

  if (!listing) {
    listing = new Listing(id);

    listing.contract = contract;
    listing.seller = getUser(seller).id;
    // TODO: Might be Inactive based on if it was staked or not??
    listing.status = "Active";
  }

  return listing;
}

function getToken(contract: Address, tokenId: BigInt): Token {
  let id = getAddressId(contract, tokenId);
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);

    // let name = getName(data.tokenId);

    token.contract = contract;
    // token.image = getImageHash(data.tokenId, name)
    //   .split(" ")
    //   .join("%20");
    // token.name = name;
    // token.rarity = getRarity(data.tokenId);
    token.tokenId = tokenId;
    token.save();
  }

  return token;
}

function getUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }

  return user;
}

/**
 * This is a generic function that can handle both ERC1155s and ERC721s
 */
function handleTransfer(
  contract: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  quantity: i32
): void {
  // let data = new Transfer(contract, to, tokenId);
  let user = getUser(to);
  let token = getToken(contract, tokenId);

  let fromUserToken = UserToken.load(`${from.toHexString()}-${token.id}`);

  if (fromUserToken) {
    fromUserToken.quantity = fromUserToken.quantity - quantity;
    fromUserToken.save();

    if (fromUserToken.quantity == 0) {
      removeIfExist("UserToken", fromUserToken.id);
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
  listing.token = getAddressId(tokenAddress, tokenId);

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

export function handleTransferBatch(event: TransferBatch): void {
  let params = event.params;
  let ids = params.ids;
  let amounts = params.values;
  let length = ids.length;

  for (let index = 0; index < length; index++) {
    let tokenId = ids[index];
    let listing = Listing.load(
      getListingId(params.from, event.address, tokenId)
    );

    // For now, we will just set them inactive
    // TODO: Handle if they had non-listed ones first...
    if (listing) {
      listing.status = "Inactive";
      listing.save();
    }

    handleTransfer(
      event.address,
      params.from,
      params.to,
      tokenId,
      amounts[index].toI32()
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let params = event.params;
  let listing = Listing.load(
    getListingId(params.from, event.address, params.id)
  );

  // For now, we will just set them inactive
  // TODO: Handle if they had non-listed ones first...
  if (listing) {
    listing.status = "Inactive";
    listing.save();
  }

  handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value.toI32()
  );
}
