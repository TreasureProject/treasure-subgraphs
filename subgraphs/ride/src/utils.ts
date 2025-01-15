import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";

import { ERC1155 } from "../generated/PepeUSD/ERC1155";
import {
  Account,
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

  // Update account statistics and arrays
  if (type == TX_TYPE_BUY) {
    account.totalBuyCount = account.totalBuyCount.plus(BIGINT_ONE);
    account.totalBaseTokenSpent =
      account.totalBaseTokenSpent.plus(baseTokenAmount);
    let buyTransactions = account.buyTransactions;
    if (!buyTransactions.includes(presaleId)) {
      buyTransactions.push(presaleId);
      account.buyTransactions = buyTransactions;
    }
  } else if (type == TX_TYPE_SELL) {
    account.totalSellCount = account.totalSellCount.plus(BIGINT_ONE);
    account.totalBaseTokenReceived =
      account.totalBaseTokenReceived.plus(baseTokenAmount);
    let sellTransactions = account.sellTransactions;
    if (!sellTransactions.includes(presaleId)) {
      sellTransactions.push(presaleId);
      account.sellTransactions = sellTransactions;
    }
  }

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
  presale.save();
  token.save();
  tx.save();
  account.save();
}

export function updateMetrics(
  presale: MemePresale,
  event: ethereum.Event
): void {
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
  supply: "10000000",
  data: {
    type: "standard",
    uri: "data:application/json;base64,ewogICAgIm5hbWUiOiAiUEVQRVVTRCIsCiAgICAiZGVzY3JpcHRpb24iOiAiUEVQRVVTRCBpcyBhbiB1bmJhY2tlZCBORlQgc3RhYmxlY29pbi4gUEVQRVVTRCB1c2VzIE5GVHMgdG8gcmVwcmVzZW50IGRpZmZlcmVudCBkZW5vbWluYXRpb25zIG9mIHN0YWJsZWNvaW4gYmlsbHMsIHNpbWlsYXIgdG8gaG93IHBoeXNpY2FsIGNhc2ggaGFzIGRpZmZlcmVudCBiaWxsIHNpemVzICgkMSwgJDUsICQxMCwgZXRjLikuIFdoZW4geW91IHNlbmQgbW9uZXkgdG8gc29tZW9uZSBlbHNlLCB0aGUgc21hcnQgY29udHJhY3Qgd2lsbCBhdXRvbWF0aWNhbGx5IGJyZWFrIG91dCB0aGUgYmlsbHMgaW50byBzbWFsbGVyIHVuaXRzIGluIG9yZGVyIHRvIHNlbmQgdGhlIGV4YWN0IGFtb3VudC4gQWZ0ZXIgdHJhbnNhY3Rpb25zLCB0aGUgc3lzdGVtIGF1dG9tYXRpY2FsbHkgY29uc29saWRhdGVzIHlvdXIgcmVtYWluaW5nIGJhbGFuY2UgaW50byB0aGUgbGFyZ2VzdCBwb3NzaWJsZSBiaWxscy4gVGhpcyBrZWVwcyB5b3VyIHdhbGxldCBvcmdhbml6ZWQgd2l0aCB0aGUgbW9zdCBlZmZpY2llbnQgY29tYmluYXRpb24gb2YgYmlsbHMgYXMgeW91ciBzdGFjayBnZXRzIGZhdHRlci4iLAogICAgImltYWdlIjogImh0dHBzOi8vYmFmeWJlaWh6d3J5NGlvZ2FjcncyNzRlY3d2c2w1eGY2ZXRpM29rcTZtZHhzeGlyeWM0NmFhaHBudmkuaXBmcy5kd2ViLmxpbms/ZmlsZW5hbWU9V2FzaGluZ3RvbiUyMCglMjQxKS5wbmciLAogICAgImNvdmVyIjogImh0dHBzOi8vYmFmeWJlaWh6d3J5NGlvZ2FjcncyNzRlY3d2c2w1eGY2ZXRpM29rcTZtZHhzeGlyeWM0NmFhaHBudmkuaXBmcy5kd2ViLmxpbms/ZmlsZW5hbWU9V2FzaGluZ3RvbiUyMCglMjQxKS5wbmciLAogICAgImV4dGVybmFsX3VybCI6ICJodHRwczovL3BlcGV1c2QudGVjaCIsCiAgICAic29jaWFsX2xpbmtzIjogewogICAgICAgICJ3ZWJzaXRlIjogImh0dHBzOi8vcGVwZXVzZC50ZWNoIgogICAgfSwKICAgICJhdHRyaWJ1dGVzIjogWwogICAgICAgIHsKICAgICAgICAgICAgInRyYWl0X3R5cGUiOiAiTlNGVyIsCiAgICAgICAgICAgICJ2YWx1ZSI6IGZhbHNlCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAgICJ0cmFpdF90eXBlIjogIlRva2VuIFR5cGUiLAogICAgICAgICAgICAidmFsdWUiOiAiRGVub21pbmF0aW9uYWwiCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAgICJ0cmFpdF90eXBlIjogIkNhdGVnb3J5IiwKICAgICAgICAgICAgInZhbHVlIjogIm1lbWUiCiAgICAgICAgfQogICAgXSwKICAgICJkZW5vbWluYXRpb25zIjogWwogICAgICAgIHsKICAgICAgICAgICAgImRlbm9tX2lkIjogMCwKICAgICAgICAgICAgInZhbHVlIjogMSwKICAgICAgICAgICAgIm5hbWUiOiAiJDEgUEVQRVVTRCIsCiAgICAgICAgICAgICJpbWFnZSI6ICJodHRwczovL2JhZnliZWloendyeTRpb2dhY3J3Mjc0ZWN3dnNsNXhmNmV0aTNva3E2bWR4c3hpcnljNDZhYWhwbnZpLmlwZnMuZHdlYi5saW5rP2ZpbGVuYW1lPVdhc2hpbmd0b24lMjAoJTI0MSkucG5nIiwKICAgICAgICAgICAgImF0dHJpYnV0ZXMiOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgInRyYWl0X3R5cGUiOiAiVmFsdWUiLAogICAgICAgICAgICAgICAgICAgICJ2YWx1ZSI6IDEKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICAiZGVub21faWQiOiAxLAogICAgICAgICAgICAidmFsdWUiOiA1LAogICAgICAgICAgICAibmFtZSI6ICIkNSBQRVBFVVNEIiwKICAgICAgICAgICAgImltYWdlIjogImh0dHBzOi8vYmFmeWJlaWN0dm9hM3BycWZwZ2dnb3hjbmtwMmNyMjYzZ2Npank2Mm1peTc2MnVhdHB5eWpkY2l6ejQuaXBmcy5kd2ViLmxpbms/ZmlsZW5hbWU9TGluY29sbiUyMCglMjQ1KS5wbmciLAogICAgICAgICAgICAiYXR0cmlidXRlcyI6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAidHJhaXRfdHlwZSI6ICJWYWx1ZSIsCiAgICAgICAgICAgICAgICAgICAgInZhbHVlIjogNQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAgICJkZW5vbV9pZCI6IDIsCiAgICAgICAgICAgICJ2YWx1ZSI6IDEwLAogICAgICAgICAgICAibmFtZSI6ICIkMTAgUEVQRVVTRCIsCiAgICAgICAgICAgICJpbWFnZSI6ICJodHRwczovL2JhZnliZWljaHByYzZsanludnpwb3B0NnBmaGh3emNpNDNvYnllbG1lenM2NGQzd3ljdGc1ZzNqbWp1LmlwZnMuZHdlYi5saW5rP2ZpbGVuYW1lPUhhbWlsdG9uJTIwKCUyNDEwKS5wbmciLAogICAgICAgICAgICAiYXR0cmlidXRlcyI6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAidHJhaXRfdHlwZSI6ICJWYWx1ZSIsCiAgICAgICAgICAgICAgICAgICAgInZhbHVlIjogMTAKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICAiZGVub21faWQiOiAzLAogICAgICAgICAgICAidmFsdWUiOiAyMCwKICAgICAgICAgICAgIm5hbWUiOiAiJDIwIFBFUEVVU0QiLAogICAgICAgICAgICAiaW1hZ2UiOiAiaHR0cHM6Ly9iYWZ5YmVpYW43aWthZW40cDNpZXByemp0bmJtNWE3MjJvajZ1dWQyamZoZmJ6Z3N0YmJ4b29mNWZtYS5pcGZzLmR3ZWIubGluaz9maWxlbmFtZT1KYWNrc29uJTIwKCUyNDIwKS5wbmciLAogICAgICAgICAgICAiYXR0cmlidXRlcyI6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAidHJhaXRfdHlwZSI6ICJWYWx1ZSIsCiAgICAgICAgICAgICAgICAgICAgInZhbHVlIjogMjAKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICAiZGVub21faWQiOiA0LAogICAgICAgICAgICAidmFsdWUiOiA1MCwKICAgICAgICAgICAgIm5hbWUiOiAiJDUwIFBFUEVVU0QiLAogICAgICAgICAgICAiaW1hZ2UiOiAiaHR0cHM6Ly9iYWZ5YmVpYmJlYmdtc2p6Y3hnN3JlZTJqaWNra2piNjVuMnE0cm1qYTdoZ3dhdTZjZHJvZ2RpaHRqcS5pcGZzLmR3ZWIubGluaz9maWxlbmFtZT1HcmFudCUyMCglMjQ1MCkucG5nIiwKICAgICAgICAgICAgImF0dHJpYnV0ZXMiOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgInRyYWl0X3R5cGUiOiAiVmFsdWUiLAogICAgICAgICAgICAgICAgICAgICJ2YWx1ZSI6IDUwCiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIF0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICAgImRlbm9tX2lkIjogNSwKICAgICAgICAgICAgInZhbHVlIjogMTAwLAogICAgICAgICAgICAibmFtZSI6ICIkMTAwIFBFUEVVU0QiLAogICAgICAgICAgICAiaW1hZ2UiOiAiaHR0cHM6Ly9iYWZ5YmVpYWU2dzJsc2V2bXoyanB3aWRkbnl4cWY3ZnduZ3B6NXpodnVmd2x2NXNpNTNvZWtranNiZS5pcGZzLmR3ZWIubGluaz9maWxlbmFtZT1GcmFua2xpbiUyMCglMjQxMDApLnBuZyIsCiAgICAgICAgICAgICJhdHRyaWJ1dGVzIjogWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICJ0cmFpdF90eXBlIjogIlZhbHVlIiwKICAgICAgICAgICAgICAgICAgICAidmFsdWUiOiAxMDAKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgICAiZGVub21faWQiOiA2LAogICAgICAgICAgICAidmFsdWUiOiAxMDAwLAogICAgICAgICAgICAibmFtZSI6ICIkMTAwMCBQRVBFVVNEIiwKICAgICAgICAgICAgImltYWdlIjogImh0dHBzOi8vYmFmeWJlaWRlaHEzb3hzcDZjb2p4aTd6ZHd6N3N2NDJ0djdjbzRib3Z5Z3A3MzRxZHc1Z3A2enlpNGUuaXBmcy5kd2ViLmxpbmsvP2ZpbGVuYW1lPUNsZXZlbGFuZCUyMCglMjQxMDAwKS5wbmciLAogICAgICAgICAgICAiYXR0cmlidXRlcyI6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAidHJhaXRfdHlwZSI6ICJWYWx1ZSIsCiAgICAgICAgICAgICAgICAgICAgInZhbHVlIjogMTAwMAogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdCiAgICAgICAgfQogICAgXQp9",
  },
};
