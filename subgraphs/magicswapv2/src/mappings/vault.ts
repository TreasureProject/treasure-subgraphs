import { log, store } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import {
  Deposit,
  Token,
  VaultCollection,
  VaultReserveItem,
  Withdrawal,
} from "../../generated/schema";
import { NftVault } from "../../generated/templates";
import {
  Deposit as DepositEvent,
  Withdraw,
} from "../../generated/templates/NftVault/NftVault";
import { getOrCreateCollection, setTokenContractData } from "../helpers";

export function handleVaultCreated(event: VaultCreated): void {
  const params = event.params;

  const vault = new Token(params.vault);
  vault.name = params.name;
  vault.symbol = params.symbol;
  setTokenContractData(vault, true);
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

  const deposit = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  deposit.transactionHash = event.transaction.hash;
  deposit.timestamp = event.block.timestamp;
  deposit.vault = event.address;
  deposit.collection = params.collection;
  deposit.tokenId = params.tokenId;
  deposit.amount = params.amount.toI32();
  deposit.save();

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
}

export function handleWithdraw(event: Withdraw): void {
  const params = event.params;

  const withdrawal = new Withdrawal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  withdrawal.transactionHash = event.transaction.hash;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.vault = event.address;
  withdrawal.collection = params.collection;
  withdrawal.tokenId = params.tokenId;
  withdrawal.amount = params.amount.toI32();
  withdrawal.save();

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
}
