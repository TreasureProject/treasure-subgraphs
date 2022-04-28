import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { _Lifeform, _LifeformOwner } from "../../generated/schema";
import { ORDERED_CLASSES } from "./constants";

export const getOrCreateLifeform = (
  tokenId: BigInt,
  owner: Address
): _Lifeform => {
  const id = tokenId.toHexString();
  let lifeform = _Lifeform.load(id);
  if (!lifeform) {
    lifeform = new _Lifeform(id);
    lifeform.save();

    const lifeformOwner = new _LifeformOwner(owner.toHexString());
    lifeformOwner.lifeform = lifeform.id;
    lifeformOwner.save();
  }

  return lifeform;
};

export const getLifeformClassByIndex = (index: i32): string => {
  if (index < 0 || index > ORDERED_CLASSES.length) {
    log.error("Unknown Lifeform class index: {}", [index.toString()]);
    return "Unknown";
  }

  return ORDERED_CLASSES[index];
};
