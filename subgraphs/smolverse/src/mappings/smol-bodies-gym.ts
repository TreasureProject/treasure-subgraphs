import { SMOL_BODIES_ADDRESS } from "@treasure/constants";

import { DropGym, JoinGym } from "../../generated/Smol Bodies Gym/Gym";
import { LOCATION_GYM } from "../helpers/constants";
import { getAttributeId } from "../helpers/ids";
import { getOrCreateAttribute, getOrCreateCollection, getOrCreateToken } from "../helpers/models";
import { handleStake, handleUnstake } from "./common";

export function handleJoinGym(event: JoinGym): void {
  handleStake(
    event.transaction.from,
    SMOL_BODIES_ADDRESS,
    event.params.tokenId,
    LOCATION_GYM
  );
}

export function handleDropGym(event: DropGym): void {
  const params = event.params;

  const tokenId = params.tokenId;
  const plates = params.plates.toString();
  const level = params.level.toString();
  const collection = getOrCreateCollection(SMOL_BODIES_ADDRESS);
  const token = getOrCreateToken(collection, tokenId);

  // Update plates attribute
  const platesAttribute = getOrCreateAttribute(
    collection,
    token,
    "Plates",
    plates,
    getAttributeId(collection, "Plates", tokenId.toHexString()),
    true
  );
  platesAttribute.value = plates;
  platesAttribute.save();

  // Remove old swol size attribute
  const swolSizeAttributeIndex = token.attributes.findIndex((id) => id.includes("swol-size"));
  if (swolSizeAttributeIndex >= 0) {
    const attributes = token.attributes;
    attributes.splice(swolSizeAttributeIndex, 1);
    token.attributes = attributes;
  }

  // Add new swol size attribute
  const swolSizeAttribute = getOrCreateAttribute(collection, token, "Swol Size", level);
  token.attributes = token.attributes.concat([swolSizeAttribute.id, platesAttribute.id]);
  token.save();

  handleUnstake(
    SMOL_BODIES_ADDRESS,
    event.params.tokenId,
    LOCATION_GYM
  );
}
