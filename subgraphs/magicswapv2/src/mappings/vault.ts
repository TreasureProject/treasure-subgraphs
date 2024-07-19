import { BigInt, store } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import {
  Token,
  TransactionItem,
  VaultCollection,
} from "../../generated/schema";
import { NftVault } from "../../generated/templates";
import { Deposit, Withdraw } from "../../generated/templates/NftVault/NftVault";
import { ZERO_BD, ZERO_BI } from "../const";
import {
  getOrCreateCollection,
  getOrCreateTransaction,
  getOrCreateUser,
  getOrCreateVaultReserveItem,
} from "../helpers";
import { exponentToBigDecimal } from "../utils";

export function handleVaultCreated(event: VaultCreated): void {
  const params = event.params;

  const vault = new Token(params.vault);
  const decimals = BigInt.fromI32(18);
  vault.name = params.name;
  vault.symbol = params.symbol;
  vault.decimals = decimals;
  vault.decimalDivisor = exponentToBigDecimal(decimals);
  vault.totalSupply = ZERO_BI;
  vault.isNFT = true;
  vault.isMAGIC = false;
  vault.isETH = false;
  vault.magicPairs = [];
  vault.volume = ZERO_BD;
  vault.volumeUSD = ZERO_BD;
  vault.txCount = ZERO_BI;
  vault.derivedMAGIC = ZERO_BD;
  vault.save();

  for (let i = 0; i < params.collections.length; i++) {
    const collection = getOrCreateCollection(
      params.collections[i].addr,
      params.collections[i].nftType
    );
    const vaultCollection = new VaultCollection(vault.id.concatI32(i));
    vaultCollection.vault = vault.id;
    vaultCollection.collection = collection.id;
    if (!params.collections[i].allowAllIds) {
      vaultCollection.tokenIds = params.collections[i].tokenIds;
    }
    vaultCollection.save();
  }

  NftVault.create(params.vault);
}

export function handleDeposit(event: Deposit): void {
  const params = event.params;
  const vault = event.address;

  const reserveItem = getOrCreateVaultReserveItem(
    vault,
    params.collection,
    params.tokenId
  );
  reserveItem.amount += params.amount.toI32();
  reserveItem.save();

  const transaction = getOrCreateTransaction(event);
  const transactionItem = new TransactionItem(
    transaction.id
      .concat(vault)
      .concat(params.collection)
      .concatI32(params.tokenId.toI32())
  );
  transactionItem.transaction = transaction.id;
  transactionItem.vault = vault;
  transactionItem.collection = params.collection;
  transactionItem.tokenId = params.tokenId;
  transactionItem.amount = params.amount.toI32();
  transactionItem.save();
}

export function handleWithdraw(event: Withdraw): void {
  const params = event.params;
  const vault = event.address;

  const reserveItem = getOrCreateVaultReserveItem(
    vault,
    params.collection,
    params.tokenId
  );
  reserveItem.amount -= params.amount.toI32();
  if (reserveItem.amount > 0) {
    reserveItem.save();
  } else {
    store.remove("VaultReserveItem", reserveItem.id.toHexString());
  }

  const transaction = getOrCreateTransaction(event);
  transaction.user = getOrCreateUser(params.to).id;
  transaction.save();

  const transactionItem = new TransactionItem(
    transaction.id
      .concat(vault)
      .concat(params.collection)
      .concatI32(params.tokenId.toI32())
  );
  transactionItem.transaction = transaction.id;
  transactionItem.vault = vault;
  transactionItem.collection = params.collection;
  transactionItem.tokenId = params.tokenId;
  transactionItem.amount = params.amount.toI32();
  transactionItem.save();
}
