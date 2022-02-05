import { log } from "matchstick-as";
import { Attribute } from "../../generated/schema";

import { BaseURIChanged, SmolPetMint, Transfer } from "../../generated/Smol Bodies Pets/SmolBodiesPets";
import { SMOL_BODIES_PETS_COLLECTION_NAME, TOKEN_STANDARD_ERC721 } from "../helpers/constants";
import { getCollectionJson, getJsonStringValue, JSON } from "../helpers/json";
import { getOrCreateAttribute, getOrCreateCollection, getOrCreateToken, getOrCreateUser } from "../helpers/models";

export function handleBaseUriChanged(event: BaseURIChanged): void {
  const params = event.params;

  const collection = getOrCreateCollection(event.address, SMOL_BODIES_PETS_COLLECTION_NAME, TOKEN_STANDARD_ERC721);
  collection.baseUri = params.to;
  collection.save();
}

// export function handleMint(event: SmolPetMint, ipfsData: JSON | null = null): void {
export function handleMint(event: SmolPetMint): void {
  const params = event.params;

  const owner = getOrCreateUser(params.to.toHexString());
  const collection = getOrCreateCollection(event.address, SMOL_BODIES_PETS_COLLECTION_NAME, TOKEN_STANDARD_ERC721);
  const token = getOrCreateToken(collection, params.tokenId);
  token.owner = owner.id;

  // const data = ipfsData || getCollectionJson(collection, `${token.tokenId}.json`);
  const data = getCollectionJson(collection, `${token.tokenId}.json`);
  if (!data) {
    return;
  }

  // Parse metadata
  const name = getJsonStringValue(data, "name");
  const description = getJsonStringValue(data, "description");
  const image = getJsonStringValue(data, "image");
  if (!name || !description || !image) {
    log.error("Token missing metadata: {}", [token.id]);
    return;
  }

  token.name = `Smol Bodies Pets ${name as string}`;
  token.description = description as string;
  token.image = image as string;

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

      attributes.push(
        getOrCreateAttribute(collection, nameData.toString(), valueData.toString())
      );
    }
    
    token.attributes = attributes.map<string>((attribute) => attribute.id);
  }

  token.save();
}

export function handleTransfer(event: Transfer): void {
  const collection = getOrCreateCollection(event.address, SMOL_BODIES_PETS_COLLECTION_NAME, TOKEN_STANDARD_ERC721);

  const token = getOrCreateToken(collection, event.params.tokenId);
  token.owner = event.params.to.toHexString();
  token.save();
}
