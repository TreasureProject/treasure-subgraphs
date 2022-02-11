import { BaseURIChanged, SmolPetMint, Transfer } from "../../generated/Smol Bodies Pets/SmolPets";
import { getCollectionJson, JSON } from "../helpers/json";
import { updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";

export function handleBaseUriChanged(event: BaseURIChanged): void {
  const params = event.params;

  const collection = getOrCreateCollection(event.address);
  collection.baseUri = params.to;
  collection.save();
}

// export function handleMint(event: SmolPetMint, ipfsData: JSON | null = null): void {
export function handleMint(event: SmolPetMint): void {
  const params = event.params;

  const owner = getOrCreateUser(params.to.toHexString());
  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, params.tokenId);
  token.owner = owner.id;

  // const data = ipfsData || getCollectionJson(collection, `${token.tokenId}.json`);
  const data = getCollectionJson(collection, `${token.tokenId}.json`);
  if (data) {
    updateTokenMetadata(token, data);
  }

  token.save();
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;

  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, params.tokenId);
  token.owner = params.to.toHexString();
  token.save();
}
