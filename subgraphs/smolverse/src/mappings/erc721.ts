import { Transfer } from "../../generated/Smol Brains/ERC721";
import { getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";

export function handleTransfer(event: Transfer): void {
  const params = event.params;

  const collection = getOrCreateCollection(event.address);
  const owner = getOrCreateUser(params.to.toHexString());
  const token = getOrCreateToken(collection, params.tokenId);
  token.owner = owner.id;
  token.name = `${collection.name} #${params.tokenId.toString()}`;
  token.save();
}
