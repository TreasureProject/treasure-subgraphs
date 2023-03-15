import { VaultCreated } from "../../generated/NftVaultFactory/NftVaultFactory";
import { NftVault, NftVaultCollection } from "../../generated/schema";
import { getOrCreateCollection } from "../helpers";

export function handleVaultCreated(event: VaultCreated): void {
  const params = event.params;

  const vault = new NftVault(params.vault);
  vault.vaultId = params.vaultId;
  vault.creator = params.creator;
  vault.name = params.name;
  vault.symbol = params.symbol;
  vault.save();

  for (let i = 0; i < params.collections.length; i++) {
    const collection = getOrCreateCollection(
      params.collections[i].addr,
      params.collections[i].nftType
    );
    const vaultCollection = new NftVaultCollection(vault.id.concatI32(i));
    vaultCollection.nftVault = vault.id;
    vaultCollection.collection = collection.id;
    if (!params.collections[i].allowAllIds) {
      vaultCollection.tokenIds = params.collections[i].tokenIds;
    }
  }
}
