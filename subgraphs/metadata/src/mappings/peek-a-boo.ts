import { Address, BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import { ERC721, Transfer } from "../../generated/Peek-A-Boo/ERC721";
import { Collection, Token } from "../../generated/schema";
import { encode } from "../helpers/base64";
import { NormalizedAttribute, updateTokenMetadata } from "../helpers/metadata";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function normalizeAttribute(name: string, value: string): NormalizedAttribute {
  const replacement = name.replace("BodyColor", "Body Color");

  return new NormalizedAttribute(replacement, value.replace(`${name} `, ""));
}

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Peek-A-Boo #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const imageIndex = tokenUri.value.indexOf(`\"image\"`);
    const attributesIndex = tokenUri.value.indexOf(`\", \"attributes\"`) + 3;

    const image = tokenUri.value.slice(imageIndex, attributesIndex);
    const base64Image = "data:image/svg+xml;base64,".concat(
      encode(
        Bytes.fromUTF8(
          image
            .slice(10, -3)
            .replace(
              "data:image/svg+xml;base64,<svg",
              `<svg xmlns="http://www.w3.org/2000/svg"`
            )
            .replaceAll(`\"`, `"`)
        )
      )
    );

    const uri = tokenUri.value
      .replace("data:application/json;base64,", "")
      .replace(image, `"image": "${base64Image}\",`)
      .replace(`\"name\": \"`, `"name": "`)
      .replace(`\", \"description\": \"`, `", "description": "`)
      .replace(`\", \"attributes\"`, `", "attributes"`)
      .replace(`[{\"trait_type\":\"`, `[{"trait_type":"`)
      .replaceAll(`\",\"value\":\"`, `","value":"`)
      .replaceAll(`\"},{\"trait_type\":\"`, `"},{"trait_type":"`)
      .replace(`\"}{\"trait_type\":\"`, `"},{"trait_type":"`)
      .replace(`\"}]`, `"}]`);

    const data = json.fromString(uri).toObject();

    if (data) {
      updateTokenMetadata(
        collection,
        token,
        data,
        timestamp,
        normalizeAttribute
      );
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
