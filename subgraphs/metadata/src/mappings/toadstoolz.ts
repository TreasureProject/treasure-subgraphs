import { Address, BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import { ERC721, Transfer } from "../../generated/Peek-A-Boo/ERC721";
import { Attribute, Collection, Token } from "../../generated/schema";
import { decode } from "../helpers/base64";
import { getTokenId } from "../helpers/ids";
import { updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection } from "../helpers/models";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Toad #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const uri = Bytes.fromUint8Array(
      decode(tokenUri.value.replace("data:application/json;base64,", ""))
    );

    const data = json.fromBytes(uri).toObject();

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

  if (event.block.number.toString() == "11079257") {
    // Reprocess 8890 toads
    const collection = getOrCreateCollection(event.address);
    const attributes = [
      "0x09cae384c6626102abe47ff50588a1dbe8432174-rarity-1 of 1",
      "0x09cae384c6626102abe47ff50588a1dbe8432174-rarity-common",
    ];
    const tokenIds: string[] = [];

    for (let index = 0; index < attributes.length; index++) {
      const attribute = Attribute.load(attributes[index]);

      if (!attribute) {
        continue;
      }

      const _tokenIds = attribute._tokenIds;

      for (let idx = 0; idx < _tokenIds.length; idx++) {
        tokenIds.push(
          getTokenId(collection, BigInt.fromString(_tokenIds[idx]))
        );
      }
    }

    collection._missingMetadataTokens = tokenIds;
    collection.save();
  }

  common.handleTransfer(transfer, fetchTokenMetadata);
}
