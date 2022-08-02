import { BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import {
  LandRarity,
  Transfer,
} from "../../generated/SamuRise Land/SamuRiseLand";
import { Collection, Token } from "../../generated/schema";
import { NormalizedAttribute, updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection, getOrCreateToken } from "../helpers/models";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function getDojoColor(dojo: i32): string {
  switch (dojo) {
    case 0:
      return "Yellow";
    case 1:
      return "Orange";
    case 2:
      return "Blue";
    case 3:
      return "Purple";
    case 4:
      return "Green";
    case 5:
      return "Red";
    case 6:
      return "Brown";
    case 7:
      return "Black";
    default:
      return "Unknown";
  }
}

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt,
  dojoId: i32
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Tengoku Land #${tokenIdString}`;

  const dojo = new NormalizedAttribute("Dojo", getDojoColor(dojoId));
  const image = "https://storage.googleapis.com/samurise/land/land.gif";

  const attributes = [dojo].map<string>(
    (stat) => `"trait_type": "${stat.name}", "value": "${stat.value}"`
  );

  const bytes = Bytes.fromUTF8(`
    {
      "name": "${token.name}",
      "description": "The Samurai have arisen from the Bogai to find Tengoku desecrated and defiled. Now all 10,020 SamuRise must work together to purify their homeland and restore the honor their land once enjoyed.",
      "image": "${image}",
      "attributes": [{${attributes.join("},{")}}]
    }
  `);

  const data = json.fromBytes(bytes).toObject();

  if (data) {
    updateTokenMetadata(collection, token, data, timestamp);
  } else {
    collection._missingMetadataTokens =
      collection._missingMetadataTokens.concat([token.id]);
  }
}

export function handleLandRarity(event: LandRarity): void {
  const params = event.params;
  const collection = getOrCreateCollection(event.address);
  const token = getOrCreateToken(collection, params.tokenId);

  fetchTokenMetadata(collection, token, event.block.timestamp, params.rarity);

  token.save();
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const transfer = new common.TransferEvent(
    event.address,
    params.tokenId,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, () => {});
}
