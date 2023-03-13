import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  TokenTraitChanged,
  TransferBatch,
  TransferSingle,
} from "../../generated/Consumable/Consumable";
import { ConsumableInfo, Token } from "../../generated/schema";
import { getAddressId, isMint } from "../helpers";
import { handleTransfer } from "../mapping";

const ensureMetadata = (contract: Address, tokenId: BigInt): void => {
  const token = Token.load(getAddressId(contract, tokenId));
  if (!token) {
    log.error("Unknown Consumable: {}", [tokenId.toString()]);
    return;
  }

  // Details are set by TokenTraitChanged event
  const metadata = new ConsumableInfo(`${token.id}-metadata`);
  metadata.type = "";
  metadata.save();

  token.category = "Consumable";
  token.name = "";
  token.image = "";
  token.metadata = metadata.id;
  token.rarity = "None";
  token.save();
};

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;

  for (let i = 0; i < params.ids.length; i += 1) {
    handleTransfer(
      event.address,
      params.from,
      params.to,
      params.ids[i],
      params.values[i]
    );

    if (isMint(params.from)) {
      ensureMetadata(event.address, params.ids[i]);
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  const params = event.params;
  handleTransfer(
    event.address,
    params.from,
    params.to,
    params.id,
    params.value
  );

  if (isMint(params.from)) {
    ensureMetadata(event.address, params.id);
  }
}

export function handleTokenTraitChanged(event: TokenTraitChanged): void {
  const params = event.params;
  const token = Token.load(getAddressId(event.address, params._tokenId));
  if (!token) {
    log.error("Changing token trait for unknown Consumable: {}", [
      params._tokenId.toString(),
    ]);
    return;
  }

  const metadata = ConsumableInfo.load(`${token.id}-metadata`);
  if (!metadata) {
    log.error("Changing token trait for unknown Consumable metadata: {}", [
      token.id,
    ]);
    return;
  }

  const data = params._traitData;
  token.name = data.name;
  token.description = data.description;
  token.image = data.url;
  token.save();

  for (let i = 0; i < data.properties.length; i += 1) {
    const name = data.properties[i].name;
    const value = data.properties[i].value;
    if (name.toLowerCase() == "type") {
      metadata.type = value;
    } else if (name.toLowerCase() == "size") {
      metadata.size = value;
    }
  }
}
