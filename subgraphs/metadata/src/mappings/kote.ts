import { Address, BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import { KOTE_QUESTING_ADDRESS } from "@treasure/constants";

import {
  ERC1155,
  TransferBatch,
  TransferSingle,
} from "../../generated/KOTE Rings/ERC1155";
import { ERC721, Transfer } from "../../generated/KOTE Squires/ERC721";
import { Collection, Token } from "../../generated/schema";
import { getIpfsJson } from "../helpers/json";
import { NormalizedAttribute, updateTokenMetadata } from "../helpers/metadata";
import { getOrCreateCollection, getOrCreateToken } from "../helpers/models";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

enum Metadata {
  Type,
  Genesis,
  Strength,
  Wisdom,
  Luck,
  Faith,
}

function getTypeName(id: i32): string {
  switch (id) {
    case 1:
      return "Strength";
    case 2:
      return "Wisdom";
    case 3:
      return "Luck";
    case 4:
      return "Faith";
    default:
      return "Unknown";
  }
}

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Squire #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const metadata = tokenUri.value
      .replace("http://kote-squires.s3-website-us-east-1.amazonaws.com/", "")
      .split("-");

    const type = new NormalizedAttribute(
      "Type",
      getTypeName(BigInt.fromString(metadata[Metadata.Type]).toI32())
    );
    const genesis = new NormalizedAttribute(
      "Genesis",
      metadata[Metadata.Genesis] == "0" ? "No" : "Yes"
    );
    const strength = new NormalizedAttribute(
      "Strength",
      metadata[Metadata.Strength]
    );
    const wisdom = new NormalizedAttribute("Wisdom", metadata[Metadata.Wisdom]);
    const luck = new NormalizedAttribute("Luck", metadata[Metadata.Luck]);
    const faith = new NormalizedAttribute("Faith", metadata[Metadata.Faith]);
    const image = `ipfs://QmYZXbjHrKSoy5ZPutJPnnuZURr6NLbVpd323HZ3G3sX9D/${type.value.toLowerCase()}${
      genesis.value == "Yes" ? "G" : ""
    }.png`;

    token.name = `${type.value} ${token.name}`;

    if (genesis.value == "Yes") {
      token.name = `Genesis ${token.name}`;
    }

    const attributes = [
      type,
      genesis,
      strength,
      wisdom,
      luck,
      faith,
    ].map<string>(
      (stat) => `"trait_type": "${stat.name}", "value": "${stat.value}"`
    );

    const bytes = Bytes.fromUTF8(`
    {
      "name": "${token.name}",
      "description": "",
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
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const timestamp = event.block.timestamp;
  const transfer = new common.TransferEvent(
    event.address,
    params.tokenId,
    isMint(params.from),
    timestamp
  );

  if (params.from.equals(KOTE_QUESTING_ADDRESS)) {
    const collection = getOrCreateCollection(event.address);
    const token = getOrCreateToken(collection, params.tokenId);

    fetchTokenMetadata(collection, token, timestamp);
  }

  common.handleTransfer(transfer, fetchTokenMetadata);
}

function fetchItemTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `KOTE Item #${tokenIdString}`;

  const contract = ERC1155.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_uri(token.tokenId);

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

export function handleTransferSingle(event: TransferSingle): void {
  const params = event.params;

  if (params.id.toI32() == 0) {
    return;
  }

  const transfer = new common.TransferEvent(
    event.address,
    params.id,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, fetchItemTokenMetadata);
}

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;
  const ids = params.ids;
  const length = ids.length;

  for (let index = 0; index < length; index++) {
    const id = ids[index];

    if (id.toI32() == 0) {
      continue;
    }

    const transfer = new common.TransferEvent(
      event.address,
      ids[index],
      isMint(params.from),
      event.block.timestamp
    );

    common.handleTransfer(transfer, fetchItemTokenMetadata);
  }
}
