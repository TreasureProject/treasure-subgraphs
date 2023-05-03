import { log, store } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import {
  Token,
  VaultCollection,
  VaultReserveItem,
} from "../../generated/schema";
import { NftVault } from "../../generated/templates";
import {
  Deposit as DepositEvent,
  Withdraw,
} from "../../generated/templates/NftVault/NftVault";
import { ZERO_BD, ZERO_BI } from "../const";
import { getOrCreateCollection, setTokenContractData } from "../helpers";

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
}
