import { Address } from "@graphprotocol/graph-ts";

import { getIpfsJson } from "@treasure/common";

import { ERC721, Transfer } from "../../generated/Wrapped Smols/ERC721";
import { Collection, Token } from "../../generated/schema";
import { checkMissingMetadata, updateTokenMetadata } from "../helpers/metadata";
import {
  getOrCreateCollection,
  getOrCreateToken,
  getOrCreateUser,
  removeToken,
} from "../helpers/models";
import { isZero } from "../helpers/utils";

function fetchTokenMetadata(collection: Collection, token: Token): void {
  const tokenIdString = token.tokenId.toString();
  token.name = `Wrapped Smol #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const data = getIpfsJson(tokenUri.value);

    if (data) {
      updateTokenMetadata(collection, token, data);
    } else {
      collection._missingMetadataTokens =
        collection._missingMetadataTokens.concat([token.id]);
    }
  }
}

export function handleTransfer(event: Transfer): void {
  const address = event.address;
  const params = event.params;
  const to = params.to;
  const tokenId = params.tokenId;

  const collection = getOrCreateCollection(address);

  if (isZero(to)) {
    // Burn
    removeToken(collection, tokenId);
    return;
  }

  const owner = getOrCreateUser(to.toHexString());
  const token = getOrCreateToken(collection, tokenId);
  token.owner = owner.id;
  fetchTokenMetadata(collection, token);
  token.save();

  checkMissingMetadata(collection, event.block.timestamp);
}
