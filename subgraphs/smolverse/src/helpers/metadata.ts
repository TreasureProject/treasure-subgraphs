import { TypedMap, log } from "@graphprotocol/graph-ts";

import {
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
} from "@treasure/constants";

import {
  Attribute,
  Collection,
  Token,
  _LandMetadata,
} from "../../generated/schema";
import { SMOL_BRAINS_LAND_BASE_URI } from "./constants";
import { getCollectionId } from "./ids";
import { JSON, getIpfsJson, getJsonStringValue } from "./json";
import { getOrCreateAttribute } from "./models";
import { toBigDecimal } from "./number";

const ATTRIBUTE_PERCENTAGE_THRESHOLDS = new TypedMap<string, number>();
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BODIES_ADDRESS.toHexString(), 6_200);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(
  SMOL_BODIES_PETS_ADDRESS.toHexString(),
  5_800
);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BRAINS_ADDRESS.toHexString(), 11_800);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(
  SMOL_BRAINS_PETS_ADDRESS.toHexString(),
  10_250
);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(
  SMOL_BRAINS_LAND_ADDRESS.toHexString(),
  i32.MAX_VALUE
);

const shouldUpdateAttributePercentages = (collection: Collection): boolean => {
  const threshold = ATTRIBUTE_PERCENTAGE_THRESHOLDS.getEntry(collection.id);
  const thresholdValue = threshold ? threshold.value : 0;
  return collection.tokensCount >= thresholdValue;
};

export function updateAttributePercentages(collection: Collection): void {
  if (!shouldUpdateAttributePercentages(collection)) {
    log.debug(
      "[metadata] Skipping attribute percentages update for collection: {}",
      [collection.id]
    );
    return;
  }

  const attributeIds = collection._attributeIds;
  const totalAttributes = attributeIds.length;
  for (let i = 0; i < totalAttributes; i++) {
    const attribute = Attribute.load(attributeIds[i]);
    if (!attribute) {
      log.warning("[metadata] Unknown attribute in collection: {}", [
        attributeIds[i],
      ]);
      continue;
    }

    if (["IQ", "Head Size"].includes(attribute.name)) {
      log.debug(
        "[metadata] Skipping attribute percentages update for attribute: {}",
        [attribute.id]
      );
      continue;
    }

    attribute.percentage = toBigDecimal(attribute._tokenIds.length)
      .div(toBigDecimal(collection.tokensCount))
      .truncate(10);
    attribute.save();
  }
}

export function fetchTokenMetadata(collection: Collection, token: Token): void {
  const tokenIdString = token.tokenId.toString();
  token.name = `${collection.name} #${tokenIdString}`;

  let landMetadata: _LandMetadata | null = null;
  let tokenUri: string | null = null;
  const isLand = collection.id == getCollectionId(SMOL_BRAINS_LAND_ADDRESS);
  if (isLand) {
    // Check for cached Land metadata
    landMetadata = _LandMetadata.load("all");
    if (landMetadata) {
      token.description = landMetadata.description;
      token.image = landMetadata.image;
      token.video = landMetadata.video;
      token.attributes = landMetadata.attributes;
    } else {
      tokenUri = `${SMOL_BRAINS_LAND_BASE_URI}0`;
    }
  } else if (collection.baseUri && collection.baseUri != "test") {
    // TODO: remove hack when Matchstick supports ipfs
    const baseUri = collection.baseUri as string;
    if (
      collection.id == getCollectionId(SMOL_BRAINS_PETS_ADDRESS) ||
      collection.id == getCollectionId(SMOL_BODIES_PETS_ADDRESS)
    ) {
      tokenUri = `${baseUri}${tokenIdString}.json`;
    } else {
      tokenUri = `${baseUri}${tokenIdString}/0`;
    }
  }

  if (tokenUri) {
    const data = getIpfsJson(tokenUri);
    if (data) {
      updateTokenMetadata(collection, token, data);
    } else {
      collection._missingMetadataTokens =
        collection._missingMetadataTokens.concat([token.id]);
    }

    // Cache Land metadata
    if (isLand && !landMetadata) {
      landMetadata = new _LandMetadata("all");
      landMetadata.description = token.description;
      landMetadata.image = token.image;
      landMetadata.video = token.video;
      landMetadata.attributes = token.attributes;
      landMetadata.save();
    }
  }
}

export function updateTokenMetadata(
  collection: Collection,
  token: Token,
  data: JSON
): void {
  // Parse metadata
  const name = getJsonStringValue(data, "name");
  if (!name) {
    log.error("[metadata] Token metadata missing name: {}", [token.id]);
    return;
  }

  token.name = `${collection.name} ${name as string}`;

  const description = getJsonStringValue(data, "description");
  if (description) {
    token.description = description as string;
  }

  const image = getJsonStringValue(data, "image");
  if (image) {
    token.image = image as string;
  }

  const video = getJsonStringValue(data, "video");
  if (video) {
    token.video = video as string;
  }

  // Parse attributes
  const attributesData = data.get("attributes");
  if (attributesData) {
    const attributesDataArr = attributesData.toArray();
    let attributes: Attribute[] = [];
    for (let i = 0; i < attributesDataArr.length; i++) {
      const attributeObj = attributesDataArr[i].toObject();
      const name = getJsonStringValue(attributeObj, "trait_type");
      const value = getJsonStringValue(attributeObj, "value");
      if (!name || !value) {
        log.error("[metadata] Attribute missing data for token: {}", [
          token.id,
        ]);
        continue;
      }

      attributes.push(
        getOrCreateAttribute(collection, token, name as string, value as string)
      );
    }

    token.attributes = attributes.map<string>((attribute) => attribute.id);

    // Update attribute percentages
    updateAttributePercentages(collection);
  }

  token.save();
}
