import { Transfer } from "../../generated/Smol Brains/ERC721";
import { getOrCreateCollection, getOrCreateToken } from "../helpers/models";

export function handleTransfer(event: Transfer): void {
  const params = event.params;

  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, params.tokenId);
  token.owner = params.to.toHexString();
  token.name = `${collection.name} #${params.tokenId.toString()}`;
  token.save();
}
