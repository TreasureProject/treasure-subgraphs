import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ERC721, Transfer } from "../../generated/Lost Donkeys/ERC721";
import { Collection, Token } from "../../generated/schema";
import { getIpfsJson, getJsonStringValue } from "../helpers/json";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Custom Smol #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const data = getIpfsJson(tokenUri.value);
    if (data) {
      token.image = getJsonStringValue(data, "image");
      token.description = getJsonStringValue(data, "description");
      const attributesData = data.get("attributes");
      if (attributesData) {
        const attributesDataArr = attributesData.toArray();
        if (attributesDataArr.length > 0) {
          const attributeObj = attributesDataArr[0].toObject();
          const name = getJsonStringValue(attributeObj, "custom_title");
          if (name) {
            token.name = name;
          }
        }
      }
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
