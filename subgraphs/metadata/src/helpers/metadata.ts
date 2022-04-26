import { BigInt, log } from "@graphprotocol/graph-ts";

import { Attribute, Collection, Token } from "../../generated/schema";
import { ATTRIBUTE_CALCULATION_UPDATE_INTERVAL } from "./constants";
import { JSON, getJsonStringValue } from "./json";
import { getOrCreateAttribute } from "./models";
import { toBigDecimal } from "./number";

export class NormalizedAttribute {
  constructor(public name: string, public value: string) {}
}

function defaultNormalizeAttribute(
  name: string,
  value: string
): NormalizedAttribute {
  return new NormalizedAttribute(name, value);
}

export function updateAttributePercentages(collection: Collection): void {
  const attributeIds = collection._attributeIds;
  const totalAttributes = attributeIds.length;

  for (let index = 0; index < totalAttributes; index++) {
    const attribute = Attribute.load(attributeIds[index]);

    if (!attribute) {
      log.warning("[metadata] Unknown attribute in collection: {}", [
        attributeIds[index],
      ]);

      continue;
    }

    attribute.percentage = toBigDecimal(attribute._tokenIds.length)
      .div(toBigDecimal(collection.tokensCount))
      .truncate(10);
    attribute.save();
  }
}

export function updateTokenMetadata(
  collection: Collection,
  token: Token,
  data: JSON,
  timestamp: BigInt,
  normalizeAttribute: (
    name: string,
    value: string
  ) => NormalizedAttribute = defaultNormalizeAttribute
): void {
  // Parse metadata
  const name = getJsonStringValue(data, "name");

  if (!name) {
    log.error("[metadata] Token metadata missing name: {}", [token.id]);

    return;
  }

  token.name = name as string;

  const description = getJsonStringValue(data, "description");

  if (description) {
    token.description = description;
  }

  const image = getJsonStringValue(data, "image");

  if (image) {
    token.image = image;
  }

  // Parse attributes
  const attributesData = data.get("attributes");

  if (attributesData) {
    const attributesDataArr = attributesData.toArray();

    let attributes: Attribute[] = [];

    for (let index = 0; index < attributesDataArr.length; index++) {
      const attributeObj = attributesDataArr[index].toObject();
      const name = getJsonStringValue(attributeObj, "trait_type");
      const value = getJsonStringValue(attributeObj, "value");

      if (!name || !value) {
        log.error("[metadata] Attribute missing data for token: {}", [
          token.id,
        ]);

        continue;
      }

      const normalized = normalizeAttribute(name as string, value as string);

      attributes.push(
        getOrCreateAttribute(
          collection,
          token,
          normalized.name,
          normalized.value
        )
      );
    }

    token.attributes = attributes.map<string>((attribute) => attribute.id);

    // TODO: Refactor somehow. Maybe hash output and check on transfer to rehash
    if (
      timestamp.gt(
        collection._attributePercentageLastUpdated.plus(
          BigInt.fromI32(ATTRIBUTE_CALCULATION_UPDATE_INTERVAL)
        )
      )
    ) {
      // Update attribute percentages
      updateAttributePercentages(collection);

      collection._attributePercentageLastUpdated = timestamp;
      collection.save();
    }
  }

  token.save();
}
