import { Bytes, log, store } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import {
  Pair,
  Token,
  Transaction,
  TransactionItem,
  VaultCollection,
  VaultReserveItem,
} from "../../generated/schema";
import { NftVault } from "../../generated/templates";
import {
  Deposit as DepositEvent,
  Withdraw,
} from "../../generated/templates/NftVault/NftVault";
import { ZERO_BD, ZERO_BI } from "../const";
import {
  addTransactionItems,
  addTransactionItems0,
  addTransactionItems1,
  getOrCreateCollection,
  getOrCreateTransaction,
  setTokenContractData,
} from "../helpers";

export function handleVaultCreated(event: VaultCreated): void {
  const params = event.params;

  const vault = new Token(params.vault);
  vault.name = params.name;
  vault.symbol = params.symbol;
  setTokenContractData(vault, true);
  vault.isNFT = true;
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

export function handleDeposit(event: DepositEvent): void {
  const params = event.params;

  const reserveItemId = event.address
    .concat(params.collection)
    .concatI32(params.tokenId.toI32());
  let reserveItem = VaultReserveItem.load(reserveItemId);
  if (!reserveItem) {
    reserveItem = new VaultReserveItem(reserveItemId);
    reserveItem.vault = event.address;
    reserveItem.collection = params.collection;
    reserveItem.tokenId = params.tokenId;
    reserveItem.amount = 0;
  }

  reserveItem.amount += params.amount.toI32();
  reserveItem.save();

  const transactionItem = new TransactionItem(
    event.transaction.hash
      .concat(event.address)
      .concat(params.collection)
      .concatI32(params.tokenId.toI32())
  );
  transactionItem.vault = event.address;
  transactionItem.collection = params.collection;
  transactionItem.tokenId = params.tokenId;
  transactionItem.amount = params.amount.toI32();
  transactionItem.save();

  const transaction = getOrCreateTransaction(event, "Deposit");
  addTransactionItems(transaction, [transactionItem.id]);
  transaction.save();
}

export function handleWithdraw(event: Withdraw): void {
  const params = event.params;

  const reserveItem = VaultReserveItem.load(
    event.address.concat(params.collection).concatI32(params.tokenId.toI32())
  );
  if (!reserveItem) {
    log.warning("Withdrawing unknown reserve item: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  reserveItem.amount -= params.amount.toI32();
  if (reserveItem.amount > 0) {
    reserveItem.save();
  } else {
    store.remove("VaultReserveItem", reserveItem.id.toHexString());
  }

  const transactionItem = new TransactionItem(
    event.transaction.hash
      .concat(event.address)
      .concat(params.collection)
      .concatI32(params.tokenId.toI32())
  );
  transactionItem.vault = event.address;
  transactionItem.collection = params.collection;
  transactionItem.tokenId = params.tokenId;
  transactionItem.amount = params.amount.toI32();
  transactionItem.save();

  const transaction = getOrCreateTransaction(event, "Withdrawal");
  let processedItems = false;

  if (transaction.swap) {
    const swapTransaction = Transaction.load(transaction.swap as Bytes);
    if (swapTransaction && swapTransaction.pair) {
      const pair = Pair.load(transaction.pair as Bytes);
      if (pair) {
        if (pair.token0.equals(event.address)) {
          addTransactionItems0(swapTransaction, [transactionItem.id]);
          processedItems = true;
        } else if (pair.token1.equals(event.address)) {
          addTransactionItems1(swapTransaction, [transactionItem.id]);
          processedItems = true;
        }
      }
    }
  } else if (transaction.pair) {
    const pair = Pair.load(transaction.pair as Bytes);
    if (pair) {
      if (pair.token0.equals(event.address)) {
        addTransactionItems0(transaction, [transactionItem.id]);
        processedItems = true;
      } else if (pair.token1.equals(event.address)) {
        addTransactionItems1(transaction, [transactionItem.id]);
        processedItems = true;
      }
    }
  }

  if (!processedItems) {
    addTransactionItems(transaction, [transactionItem.id]);
  }

  transaction.save();
}
