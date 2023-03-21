import {
  TokenTraitChanged,
  TransferBatch,
  TransferSingle,
} from "../../generated/Consumable/Consumable";
import { ConsumableInfo } from "../../generated/schema";
import { isMint } from "../helpers";
import { getOrCreateToken } from "../helpers/token";
import { handleTransfer } from "../mapping";

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
      const token = getOrCreateToken(event.address, params.ids[i]);
      token.category = "Consumable";
      token.save();
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
    const token = getOrCreateToken(event.address, params.id);
    token.category = "Consumable";
    token.save();
  }
}

export function handleTokenTraitChanged(event: TokenTraitChanged): void {
  const params = event.params;
  const data = params._traitData;
  const token = getOrCreateToken(event.address, params._tokenId);
  const metadataId = `${token.id}-metadata`;
  let metadata = ConsumableInfo.load(metadataId);
  if (!metadata) {
    metadata = new ConsumableInfo(metadataId);
  }

  for (let i = 0; i < data.properties.length; i += 1) {
    const name = data.properties[i].name;
    const value = data.properties[i].value;
    if (name.toLowerCase() == "type") {
      metadata.type = value;
    } else if (name.toLowerCase() == "size") {
      metadata.size = value;
    }
  }

  metadata.save();

  token.category = "Consumable";
  token.name = data.name;
  token.description = data.description;
  token.image = data.url;
  token.metadata = metadataId;
  token.save();
}
