import { JSONValueKind, log, TypedMap } from "@graphprotocol/graph-ts";
import {
  SMOL_BODIES_ADDRESS,
  SMOL_BODIES_PETS_ADDRESS,
  SMOL_BRAINS_ADDRESS,
  SMOL_BRAINS_LAND_ADDRESS,
  SMOL_BRAINS_PETS_ADDRESS,
} from "@treasure/constants";

import { Attribute, Collection, Token } from "../../generated/schema";
import { getJsonStringValue, JSON } from "./json";
import { getOrCreateAttribute } from "./models";
import { toBigDecimal } from "./number";


const ATTRIBUTE_PERCENTAGE_THRESHOLDS = new TypedMap<string, number>();
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BODIES_ADDRESS.toHexString(), 6_200);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BODIES_PETS_ADDRESS.toHexString(), 5_800);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BRAINS_ADDRESS.toHexString(), 11_800);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BRAINS_PETS_ADDRESS.toHexString(), 10_250);
ATTRIBUTE_PERCENTAGE_THRESHOLDS.set(SMOL_BRAINS_LAND_ADDRESS.toHexString(), i32.MAX_VALUE);

const shouldUpdateAttributePercentages = (collection: Collection): boolean => {
  const threshold = ATTRIBUTE_PERCENTAGE_THRESHOLDS.getEntry(collection.id);
  const thresholdValue = threshold ? threshold.value : 0;
  return collection.tokensCount >= thresholdValue;
};

export function updateAttributePercentages(collection: Collection): void {
  if (!shouldUpdateAttributePercentages(collection)) {
    log.debug("Skipping attribute percentages update for collection: {}", [collection.id]);
    return;
  }

  const attributeIds = collection._attributeIds;
  const totalAttributes = attributeIds.length;
  for (let i = 0; i < totalAttributes; i++) {
    const attribute = Attribute.load(attributeIds[i]);
    if (!attribute) {
      log.warning("Unknown attribute in collection: {}", [attributeIds[i]]);
      continue;
    }

    if (["IQ", "Head Size"].includes(attribute.name)) {
      log.debug("Skipping attribute percentages update for attribute: {}", [attribute.id])
      continue;
    }

    attribute.percentage =
      toBigDecimal(attribute._tokenIds.length)
        .div(toBigDecimal(collection.tokensCount))
        .truncate(10);
    attribute.save();
  }
}

export function updateTokenMetadata(token: Token, data: JSON): void {
  const collection = Collection.load(token.collection);

  if (!collection) {
    log.error("Token missing collection: {}, {}", [token.id, token.collection]);
    return;
  }

  // Parse metadata
  const name = getJsonStringValue(data, "name");
  if (!name) {
    log.error("Token metadata missing name: {}", [token.id]);
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

  // Parse attributes
  const attributesData = data.get("attributes");
  if (attributesData) {
    const attributesDataArr = attributesData.toArray();
    let attributes: Attribute[] = [];
    for (let i = 0; i < attributesDataArr.length; i++) {
      const attributeObj = attributesDataArr[i].toObject();
      const nameData = attributeObj.get("trait_type");
      const valueData = attributeObj.get("value");
      if (!nameData || !valueData) {
        log.error("Attribute missing data for token: {}", [token.id]);
        continue;
      }

      const name = nameData.toString();
      const value = valueData.kind === JSONValueKind.NUMBER ? valueData.toI64().toString() : valueData.toString();
      attributes.push(getOrCreateAttribute(collection, token, name, value));
    }
    
    token.attributes = attributes.map<string>((attribute) => attribute.id);

    // Update attribute percentages
    updateAttributePercentages(collection);
  }

  token.save();
}
