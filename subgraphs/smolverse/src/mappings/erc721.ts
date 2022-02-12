import { log } from "@graphprotocol/graph-ts";

import { ERC721, Transfer } from "../../generated/Smol Brains/ERC721";
import { getIpfsJson, JSON } from "../helpers/json";
import { updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";
import { isMint } from "../helpers/utils";

// export function handleTransfer(event: Transfer, ipfsData: JSON | null = null): void {
export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const address = event.address;
  const tokenId = params.tokenId;
  const tokenIdString = tokenId.toString();

  const collection = getOrCreateCollection(address);
  const owner = getOrCreateUser(params.to.toHexString());
  const token = getOrCreateToken(collection, tokenId);
  token.owner = owner.id;

  if (isMint(params.from)) {
    token.name = `${collection.name} #${tokenIdString}`;
    const contract = ERC721.bind(address);
    const tokenUri = contract.try_tokenURI(tokenId);
    if (!tokenUri.reverted) {
      // const data = ipfsData || getIpfsJson(tokenUri.value);
      const data = getIpfsJson(tokenUri.value);
      if (data) {
        updateTokenMetadata(token, data);
      }
    } else {
      log.warning("Token URI failed for: {}", [tokenIdString]);
    }
  }

  token.save();
}
