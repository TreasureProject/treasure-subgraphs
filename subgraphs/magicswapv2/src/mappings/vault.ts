import { BigInt } from "@graphprotocol/graph-ts";

import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import { Token, VaultCollection } from "../../generated/schema";
import { ZERO_BD, ZERO_BI } from "../const";
import { getOrCreateCollection } from "../helpers";

export function handleVaultCreated(event: VaultCreated): void {
  const params = event.params;

  const vault = new Token(params.vault);
  vault.name = params.name;
  vault.symbol = params.symbol;
  vault.decimals = BigInt.fromI32(18);
  vault.totalSupply = ZERO_BI;
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
}
