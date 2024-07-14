import { Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  NFTLiquidityAdded,
  NFTLiquidityRemoved,
  NFTNFTLiquidityAdded,
  NFTNFTLiquidityRemoved,
} from "../../generated/MagicswapV2Router/MagicswapV2Router";
import { Pair, TransactionItem } from "../../generated/schema";
import {
  getOrCreateTransaction,
  getOrCreateUser,
  getOrCreateVaultReserveItem,
} from "../helpers";

export function handleNftLiquidityAdded(event: NFTLiquidityAdded): void {
  const params = event.params;

  const pair = Pair.load(params.pair);
  if (!pair) {
    log.error("Error adding NFT liquidity to unknown Pair: {}", [
      params.pair.toHexString(),
    ]);
    return;
  }

  let items0: Bytes[] = [];
  let items1: Bytes[] = [];

  for (let i = 0; i < params.vault.collection.length; i += 1) {
    const vault = params.vault.token;
    const collection = params.vault.collection[i];
    const tokenId = params.vault.tokenId[i];
    const amount = params.vault.amount[i].toI32();

    const reserveItem = getOrCreateVaultReserveItem(vault, collection, tokenId);
    reserveItem.amount += amount;
    reserveItem.save();

    const transactionItem = new TransactionItem(
      event.transaction.hash
        .concat(vault)
        .concat(collection)
        .concatI32(tokenId.toI32())
    );
    transactionItem.vault = vault;
    transactionItem.collection = collection;
    transactionItem.tokenId = tokenId;
    transactionItem.amount = amount;
    transactionItem.save();

    if (vault.equals(pair.token0)) {
      items0.push(transactionItem.id);
    } else if (vault.equals(pair.token1)) {
      items1.push(transactionItem.id);
    }
  }

  const transaction = getOrCreateTransaction(event);
  transaction.type = "Deposit";
  transaction.user = getOrCreateUser(params.to).id;
  transaction.items0 = items0;
  transaction.items1 = items1;
  transaction.save();
}

export function handleNftLiquidityRemoved(event: NFTLiquidityRemoved): void {
  const params = event.params;

  const pair = Pair.load(params.pair);
  if (!pair) {
    log.error("Error removing NFT liquidity from unknown Pair: {}", [
      params.pair.toHexString(),
    ]);
    return;
  }

  let items0: Bytes[] = [];
  let items1: Bytes[] = [];

  for (let i = 0; i < params.vault.collection.length; i += 1) {
    const vault = params.vault.token;
    const collection = params.vault.collection[i];
    const tokenId = params.vault.tokenId[i];
    const amount = params.vault.amount[i].toI32();

    const reserveItem = getOrCreateVaultReserveItem(vault, collection, tokenId);
    reserveItem.amount -= amount;
    if (reserveItem.amount > 0) {
      reserveItem.save();
    } else {
      store.remove("VaultReserveItem", reserveItem.id.toHexString());
    }

    const transactionItem = new TransactionItem(
      event.transaction.hash
        .concat(vault)
        .concat(collection)
        .concatI32(tokenId.toI32())
    );
    transactionItem.vault = vault;
    transactionItem.collection = collection;
    transactionItem.tokenId = tokenId;
    transactionItem.amount = amount;
    transactionItem.save();

    if (vault.equals(pair.token0)) {
      items0.push(transactionItem.id);
    } else if (vault.equals(pair.token1)) {
      items1.push(transactionItem.id);
    }
  }

  const transaction = getOrCreateTransaction(event);
  transaction.type = "Withdrawal";
  transaction.user = getOrCreateUser(params.to).id;
  transaction.items0 = items0;
  transaction.items1 = items1;
  transaction.save();
}

export function handleNftNftLiquidityAdded(event: NFTNFTLiquidityAdded): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Deposit";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}

export function handleNftNftLiquidityRemoved(
  event: NFTNFTLiquidityRemoved
): void {
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Withdrawal";
  transaction.user = getOrCreateUser(event.params.to).id;
  transaction.save();
}
