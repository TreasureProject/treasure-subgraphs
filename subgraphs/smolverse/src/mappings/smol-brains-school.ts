import { BigInt, log } from "@graphprotocol/graph-ts";

import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";

import {
  DropSchool,
  JoinSchool,
} from "../../generated/Smol Brains School/School";
import { SmolBrains } from "../../generated/Smol Brains/SmolBrains";
import { LOCATION_SCHOOL } from "../helpers/constants";
import { getAttributeId } from "../helpers/ids";
import {
  getOrCreateAttribute,
  getOrCreateCollection,
  getOrCreateToken,
} from "../helpers/models";
import { weiToEther } from "../helpers/number";
import { handleStake, handleUnstake } from "./common";

export function handleJoinSchool(event: JoinSchool): void {
  handleStake(
    event.transaction.from,
    SMOL_BRAINS_ADDRESS,
    event.params.tokenId,
    LOCATION_SCHOOL
  );
}

export function handleDropSchool(event: DropSchool): void {
  const tokenId = event.params.tokenId;

  const contract = SmolBrains.bind(SMOL_BRAINS_ADDRESS);
  const collection = getOrCreateCollection(SMOL_BRAINS_ADDRESS);
  const token = getOrCreateToken(collection, tokenId);

  // Get new IQ
  const iq = contract.try_brainz(tokenId);
  if (!iq.reverted) {
    // Update IQ attribute
    const iqValue = iq.value.toString();
    const iqAttribute = getOrCreateAttribute(
      collection,
      token,
      "IQ",
      iqValue,
      getAttributeId(collection, "IQ", tokenId.toHexString()),
      true
    );
    iqAttribute.value = iqValue;
    iqAttribute.save();

    // Update Head Size attribute
    const level = Math.min(
      Math.floor(
        weiToEther(BigInt.fromString(iqAttribute.value).div(BigInt.fromI32(50)))
      ),
      5
    );
    const levelString = level.toString().replace(".0", "");

    // Remove old head size attribute
    const headSizeAttributeIndex = token.attributes.findIndex((id) =>
      id.includes("head-size")
    );
    if (headSizeAttributeIndex >= 0) {
      const attributes = token.attributes;
      attributes.splice(headSizeAttributeIndex, 1);
      token.attributes = attributes;
    }

    const headSizeAttribute = getOrCreateAttribute(
      collection,
      token,
      "Head Size",
      levelString
    );

    const image = token.image;

    if (image) {
      token.image = image.slice(0, -5).concat(`${levelString}.png`);
    }

    token.attributes = token.attributes.concat([
      headSizeAttribute.id,
      iqAttribute.id,
    ]);

    token.save();
  } else {
    log.error("[smol-brains-school] Error fetching new IQ: {}", [
      tokenId.toString(),
    ]);
  }

  handleUnstake(SMOL_BRAINS_ADDRESS, tokenId, LOCATION_SCHOOL);
}
