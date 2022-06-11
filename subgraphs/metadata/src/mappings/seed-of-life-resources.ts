import { Address, BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import {
  ERC1155,
  TransferBatch,
  TransferSingle,
} from "../../generated/Seed of Life Resources/ERC1155";
import { Collection, Token } from "../../generated/schema";
import { decode } from "../helpers/base64";
import { updateTokenMetadata } from "../helpers/metadata";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  if (token.name != "") {
    return;
  }

  const contract = ERC1155.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_uri(token.tokenId);

  if (!tokenUri.reverted && tokenUri.value != "") {
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

  common.handleTransfer(transfer, fetchTokenMetadata);
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
      id,
      isMint(params.from),
      event.block.timestamp
    );

    common.handleTransfer(transfer, fetchTokenMetadata);
  }
}
