import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";

import { ERC1155 } from "../generated/PepeUSD/ERC1155";
import {
  Account,
  Global,
  MemePresale,
  TokenHolding,
  Transaction,
} from "../generated/schema";
import {
  BIGINT_ONE,
  BIGINT_ZERO,
  TX_TYPE_BUY,
  TX_TYPE_SELL,
} from "./constants";

export function calculateWETHPrice(
  amount: BigInt,
  baseTokenAmount: BigInt
): BigInt {
  if (amount.equals(BIGINT_ZERO)) {
    return BIGINT_ZERO;
  }
  return baseTokenAmount.div(amount);
}

export function getOrCreateGlobal(): Global {
  let global = Global.load("0");
  if (!global) {
    global = new Global("0");
    global.totalPresales = BIGINT_ZERO;
    global.totalGraduated = BIGINT_ZERO;
    global.totalTransactions = BIGINT_ZERO;
    global.totalBuyTransactions = BIGINT_ZERO;
    global.totalSellTransactions = BIGINT_ZERO;
    global.totalBaseTokenRaised = BIGINT_ZERO;

    global.createdAt = BIGINT_ZERO;
    global.updatedAt = BIGINT_ZERO;
  }

  return global;
}

export function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());

  if (!account) {
    account = new Account(address.toHexString());
    account.address = address;
    account.totalBuyCount = BIGINT_ZERO;
    account.totalSellCount = BIGINT_ZERO;
    account.totalBaseTokenSpent = BIGINT_ZERO;
    account.totalBaseTokenReceived = BIGINT_ZERO;
    account.buyTransactions = [];
    account.sellTransactions = [];
    account.createdAt = BIGINT_ZERO;
    account.updatedAt = BIGINT_ZERO;
    account.save();
  }

  return account;
}

export function createTransaction(
  event: ethereum.Event,
  type: string,
  _from: Address, // account (on presale), vault/account on swap
  to: Address,
  amount: BigInt,
  baseTokenAmount: BigInt,
  presaleId: string,
  accountId: Address
): void {
  let presale = MemePresale.load(presaleId);
  if (!presale) {
    log.error("Presale not found: {}", [presaleId]);
    return;
  }

  log.info("saving tx to account: {} type: {} meme: {}", [
    accountId.toHexString(),
    type,
    presale.name,
  ]);

  let account = getOrCreateAccount(accountId);
  let txId =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

  let tx = new Transaction(txId);
  tx.hash = event.transaction.hash;
  tx.type = type;
  tx.from = account.address;
  tx.to = to;
  tx.amount = amount;
  tx.baseTokenAmount = baseTokenAmount;

  // Calculate price in WETH
  if (amount.gt(BIGINT_ZERO)) {
    presale.lastPrice = calculateWETHPrice(amount, baseTokenAmount);
    presale.save();
  }

  tx.memePresale = presaleId;
  tx.account = account.id;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.logIndex = event.logIndex;

  //update tokens
  let token = TokenHolding.load(presaleId + accountId.toHexString());
  if (!token) {
    token = new TokenHolding(presaleId + accountId.toHexString());
    token.memePresale = presaleId;
    token.account = account.id;
    token.totalValue = BIGINT_ZERO;
    token.balance = BIGINT_ZERO;
  }

  let ercBalance: BigInt;
  const erc1155 = ERC1155.bind(Address.fromString(presaleId));
  const isDenom = Address.fromString(presaleId).equals(
    Address.fromString(pepe_collection.address)
  );
  if (isDenom) {
    ercBalance = erc1155.getAtomicBalance(accountId); //denoms use balanceOf
  } else {
    ercBalance = erc1155.totalBalanceOf(accountId); //only on normal erc1155
  }

  const prevBalance = token.balance;
  const global = getOrCreateGlobal();

  // Update account statistics and arrays
  if (type == TX_TYPE_BUY) {
    global.totalBaseTokenRaised =
      global.totalBaseTokenRaised.plus(baseTokenAmount);
    global.totalBuyTransactions = global.totalBuyTransactions.plus(BIGINT_ONE);

    presale.totalBuyCount = presale.totalBuyCount.plus(BIGINT_ONE);
    account.totalBuyCount = account.totalBuyCount.plus(BIGINT_ONE);
    account.totalBaseTokenSpent =
      account.totalBaseTokenSpent.plus(baseTokenAmount);
    let buyTransactions = account.buyTransactions;
    if (!buyTransactions.includes(presaleId)) {
      buyTransactions.push(presaleId);
      account.buyTransactions = buyTransactions;
    }
  } else if (type == TX_TYPE_SELL) {
    global.totalBaseTokenRaised =
      global.totalBaseTokenRaised.minus(baseTokenAmount);
    global.totalSellTransactions =
      global.totalSellTransactions.plus(BIGINT_ONE);

    presale.totalSellCount = presale.totalSellCount.plus(BIGINT_ONE);
    account.totalSellCount = account.totalSellCount.plus(BIGINT_ONE);
    account.totalBaseTokenReceived =
      account.totalBaseTokenReceived.plus(baseTokenAmount);
    let sellTransactions = account.sellTransactions;
    if (!sellTransactions.includes(presaleId)) {
      sellTransactions.push(presaleId);
      account.sellTransactions = sellTransactions;
    }
  }

  global.totalTransactions = global.totalTransactions.plus(BIGINT_ONE);
  token.balance = ercBalance;

  log.info("account token: {} prev: {}, balance: {}, type: {}, SAME?: {}", [
    presale.name,
    prevBalance.toString(),
    token.balance.toString(),
    type,
    presale.id === token.id ? "YES" : "NO",
  ]);

  // Update timestamps
  account.updatedAt = event.block.timestamp;
  if (account.createdAt.equals(BIGINT_ZERO)) {
    account.createdAt = event.block.timestamp;
  }

  // Save entities
  global.save();
  presale.save();
  token.save();
  tx.save();
  account.save();
}

export function updateMetrics(presaleId: string, event: ethereum.Event): void {
  const presale = MemePresale.load(presaleId);
  if (!presale) return;

  if (!presale.graduated) {
    // For presale phase, use presale price
    presale.marketCap = presale.totalsupply.times(presale.presalePrice);
  } else {
    // For graduated tokens, use the last transaction price in WETH
    presale.marketCap = presale.totalsupply.times(presale.lastPrice);
  }

  log.info("presale {} mcap: {}, lastPrice: {}, supply: {}, calc: {}", [
    presale.name,
    presale.marketCap.toString(),
    presale.lastPrice.toString(),
    presale.totalsupply.toString(),
    presale.totalsupply.times(presale.lastPrice).toString(),
  ]);

  presale.updatedAt = event.block.timestamp;
  presale.updatedAtBlock = event.block.number;
  presale.save();
}

export function getUniqueBuyers(presaleId: string): BigInt {
  let presale = MemePresale.load(presaleId);
  if (!presale) return BIGINT_ZERO;

  return presale.uniqueBuyerCount;
}

export function getUniqueSellers(presaleId: string): BigInt {
  let presale = MemePresale.load(presaleId);
  if (!presale) return BIGINT_ZERO;

  return presale.uniqueSellerCount;
}

export function updateTransactionArrays(
  account: Account,
  presaleId: string,
  type: string
): void {
  if (type == "BUY") {
    let buyTransactions = account.buyTransactions;
    if (!buyTransactions.includes(presaleId)) {
      buyTransactions.push(presaleId);
      account.buyTransactions = buyTransactions;
    }
  } else if (type == "SELL") {
    let sellTransactions = account.sellTransactions;
    if (!sellTransactions.includes(presaleId)) {
      sellTransactions.push(presaleId);
      account.sellTransactions = sellTransactions;
    }
  }
}

export class COLLECTION_DATA {
  type: string;
  uri: string;
}

export class COLLECTION {
  name: string;
  address: string;
  symbol: string;
  supply: string;
  lpAddress: string;
  data: COLLECTION_DATA;
}

export const pepe_collection: COLLECTION = {
  name: "PepeUSD",
  symbol: "PEPEUSD",
  address: "0xBfB245280D60e30Cc033bC79bD1317614ec3016d",
  lpAddress: "0x9c3cf352a83c35d5775c665a403f9bb0a3decd14",
  supply: "1000000000",
  data: {
    type: "denominational",
    uri: "data:application/json;base64,eyJuYW1lIjoiUEVQRVVTRCIsImRlc2NyaXB0aW9uIjoiUEVQRVVTRCBpcyBhbiB1bmJhY2tlZCBORlQgc3RhYmxlY29pbi4gUEVQRVVTRCB1c2VzIE5GVHMgdG8gcmVwcmVzZW50IGRpZmZlcmVudCBkZW5vbWluYXRpb25zIG9mIHN0YWJsZWNvaW4gYmlsbHMsIHNpbWlsYXIgdG8gaG93IHBoeXNpY2FsIGNhc2ggaGFzIGRpZmZlcmVudCBiaWxsIHNpemVzICgkMSwgJDUsICQxMCwgZXRjLikuIFdoZW4geW91IHNlbmQgbW9uZXkgdG8gc29tZW9uZSBlbHNlLCB0aGUgc21hcnQgY29udHJhY3Qgd2lsbCBhdXRvbWF0aWNhbGx5IGJyZWFrIG91dCB0aGUgYmlsbHMgaW50byBzbWFsbGVyIHVuaXRzIGluIG9yZGVyIHRvIHNlbmQgdGhlIGV4YWN0IGFtb3VudC4gQWZ0ZXIgdHJhbnNhY3Rpb25zLCB0aGUgc3lzdGVtIGF1dG9tYXRpY2FsbHkgY29uc29saWRhdGVzIHlvdXIgcmVtYWluaW5nIGJhbGFuY2UgaW50byB0aGUgbGFyZ2VzdCBwb3NzaWJsZSBiaWxscy4gVGhpcyBrZWVwcyB5b3VyIHdhbGxldCBvcmdhbml6ZWQgd2l0aCB0aGUgbW9zdCBlZmZpY2llbnQgY29tYmluYXRpb24gb2YgYmlsbHMgYXMgeW91ciBzdGFjayBnZXRzIGZhdHRlci4iLCJpbWFnZSI6ImlwZnM6Ly9RbU56QVZycWhORHE3em1zWVE0MUxOQUJpVXV1Z3VyMVU3Zlk0VjFKZnhWRXV6IiwiY292ZXIiOiJpcGZzOi8vUW1jTVZRVjZaVE5GYnp1dEpFWVdmd1lTUWlzRGV6bmNCenRhTVppWlptTUh4RiIsImV4dGVybmFsX3VybCI6Imh0dHBzOi8vcGVwZXVzZC50ZWNoIiwic29jaWFsX2xpbmtzIjp7IndlYnNpdGUiOiJodHRwczovL3BlcGV1c2QudGVjaCJ9LCJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjoiTlNGVyIsInZhbHVlIjpmYWxzZX0seyJ0cmFpdF90eXBlIjoiVG9rZW4gVHlwZSIsInZhbHVlIjoiRGVub21pbmF0aW9uYWwifSx7InRyYWl0X3R5cGUiOiJDYXRlZ29yeSIsInZhbHVlIjoibWVtZSJ9XSwiZGVub21pbmF0aW9ucyI6W3siZGVub21faWQiOjAsInZhbHVlIjoxLCJuYW1lIjoiJDEgUEVQRVVTRCIsImltYWdlIjoiaHR0cHM6Ly9pcGZzLmZpbGViYXNlLmlvL2lwZnMvUW1jRThzQVlrUXBlbm1Zc1dUUjZwOURSQU5lUzdyQXBzVGptM0o5dHdqM3NxTS8xLnBuZyIsImF0dHJpYnV0ZXMiOlt7InRyYWl0X3R5cGUiOiJWYWx1ZSIsInZhbHVlIjoxfV19LHsiZGVub21faWQiOjEsInZhbHVlIjo1LCJuYW1lIjoiJDUgUEVQRVVTRCIsImltYWdlIjoiaHR0cHM6Ly9pcGZzLmZpbGViYXNlLmlvL2lwZnMvUW1jRThzQVlrUXBlbm1Zc1dUUjZwOURSQU5lUzdyQXBzVGptM0o5dHdqM3NxTS81LnBuZyIsImF0dHJpYnV0ZXMiOlt7InRyYWl0X3R5cGUiOiJWYWx1ZSIsInZhbHVlIjo1fV19LHsiZGVub21faWQiOjIsInZhbHVlIjoxMCwibmFtZSI6IiQxMCBQRVBFVVNEIiwiaW1hZ2UiOiJodHRwczovL2lwZnMuZmlsZWJhc2UuaW8vaXBmcy9RbWNFOHNBWWtRcGVubVlzV1RSNnA5RFJBTmVTN3JBcHNUam0zSjl0d2ozc3FNLzEwLnBuZyIsImF0dHJpYnV0ZXMiOlt7InRyYWl0X3R5cGUiOiJWYWx1ZSIsInZhbHVlIjoxMH1dfSx7ImRlbm9tX2lkIjozLCJ2YWx1ZSI6MjAsIm5hbWUiOiIkMjAgUEVQRVVTRCIsImltYWdlIjoiaHR0cHM6Ly9pcGZzLmZpbGViYXNlLmlvL2lwZnMvUW1jRThzQVlrUXBlbm1Zc1dUUjZwOURSQU5lUzdyQXBzVGptM0o5dHdqM3NxTS8yMC5wbmciLCJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjoiVmFsdWUiLCJ2YWx1ZSI6MjB9XX0seyJkZW5vbV9pZCI6NCwidmFsdWUiOjUwLCJuYW1lIjoiJDUwIFBFUEVVU0QiLCJpbWFnZSI6Imh0dHBzOi8vaXBmcy5maWxlYmFzZS5pby9pcGZzL1FtY0U4c0FZa1FwZW5tWXNXVFI2cDlEUkFOZVM3ckFwc1RqbTNKOXR3ajNzcU0vNTAucG5nIiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6IlZhbHVlIiwidmFsdWUiOjUwfV19LHsiZGVub21faWQiOjUsInZhbHVlIjoxMDAsIm5hbWUiOiIkMTAwIFBFUEVVU0QiLCJpbWFnZSI6Imh0dHBzOi8vaXBmcy5maWxlYmFzZS5pby9pcGZzL1FtY0U4c0FZa1FwZW5tWXNXVFI2cDlEUkFOZVM3ckFwc1RqbTNKOXR3ajNzcU0vMTAwLnBuZyIsImF0dHJpYnV0ZXMiOlt7InRyYWl0X3R5cGUiOiJWYWx1ZSIsInZhbHVlIjoxMDB9XX0seyJkZW5vbV9pZCI6NiwidmFsdWUiOjEwMDAsIm5hbWUiOiIkMTAwMCBQRVBFVVNEIiwiaW1hZ2UiOiJodHRwczovL2lwZnMuZmlsZWJhc2UuaW8vaXBmcy9RbWNFOHNBWWtRcGVubVlzV1RSNnA5RFJBTmVTN3JBcHNUam0zSjl0d2ozc3FNLzEwMDAucG5nIiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6IlZhbHVlIiwidmFsdWUiOjEwMDB9XX1dfQ",
  },
};
