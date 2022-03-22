import { Address, Bytes, json, log } from "@graphprotocol/graph-ts";

import { ERC721 } from "../../generated/Peek-A-Boo/ERC721";
import { Attribute, Collection, Token } from "../../generated/schema";
import { encode } from "./base64";
import { JSON, getJsonStringValue } from "./json";
import { getOrCreateAttribute } from "./models";
import { toBigDecimal } from "./number";

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

export function fetchTokenMetadata(collection: Collection, token: Token): void {
  const tokenIdString = token.tokenId.toString();

  token.name = `Peek-A-Boo #${tokenIdString}`;

  const contract = ERC721.bind(Address.fromString(collection.id));
  const tokenUri = contract.try_tokenURI(token.tokenId);

  if (!tokenUri.reverted) {
    const imageIndex = tokenUri.value.indexOf(`\"image\"`);
    const attributesIndex = tokenUri.value.indexOf(`\", \"attributes\"`) + 3;

    const image = tokenUri.value.slice(imageIndex, attributesIndex);
    const base64Image = "data:image/svg+xml;base64,".concat(
      encode(
        Bytes.fromUTF8(
          image
            .slice(10, -3)
            .replace(
              "data:image/svg+xml;base64,<svg",
              `<svg xmlns="http://www.w3.org/2000/svg"`
            )
            .replaceAll(`\"`, `"`)
        )
      )
    );

    const uri = tokenUri.value
      .replace("data:application/json;base64,", "")
      .replace(image, `"image": "${base64Image}\",`)
      .replace(`\"name\": \"`, `"name": "`)
      .replace(`\", \"description\": \"`, `", "description": "`)
      .replace(`\", \"attributes\"`, `", "attributes"`)
      .replace(`[{\"trait_type\":\"`, `[{"trait_type":"`)
      .replaceAll(`\",\"value\":\"`, `","value":"`)
      .replaceAll(`\"},{\"trait_type\":\"`, `"},{"trait_type":"`)
      .replace(`\"}{\"trait_type\":\"`, `"},{"trait_type":"`)
      .replace(`\"}]`, `"}]`);

    const data = json.fromString(uri).toObject();

    if (data) {
      updateTokenMetadata(collection, token, data);
    } else {
      collection._missingMetadataTokens =
        collection._missingMetadataTokens.concat([token.id]);
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

      attributes.push(
        getOrCreateAttribute(
          collection,
          token,
          name as string,
          (value as string).replace(`${name as string} `, "")
        )
      );
    }

    token.attributes = attributes.map<string>((attribute) => attribute.id);

    // Update attribute percentages
    updateAttributePercentages(collection);
  }

  token.save();
}
