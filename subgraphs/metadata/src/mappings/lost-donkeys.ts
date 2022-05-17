import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ERC721, Transfer } from "../../generated/Lost Donkeys/ERC721";
import { Collection, Token } from "../../generated/schema";
import { getIpfsJson } from "../helpers/json";
import { updateTokenMetadata } from "../helpers/metadata";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Donkey #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const data = getIpfsJson(tokenUri.value);

    if (data) {
      updateTokenMetadata(collection, token, data, timestamp);
    } else {
      collection._missingMetadataTokens =
        collection._missingMetadataTokens.concat([token.id]);
    }
  }
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const transfer = new common.TransferEvent(
    event.address,
    params.tokenId,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, fetchTokenMetadata);
}
