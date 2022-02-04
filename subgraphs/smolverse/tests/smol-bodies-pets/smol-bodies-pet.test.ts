import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import { createBaseUriChangedEvent, createSmolPetMintEvent } from "./utils";
import { handleBaseUriChanged, handleMint } from "../../src/mappings/smol-bodies-pet";
import { Bytes, json } from "@graphprotocol/graph-ts";
import { Collection } from "../../generated/schema";

const COLLECTION_ENTITY_TYPE = "Collection";
const ATTRIBUTE_ENTITY_TYPE = "Attribute";
const SMOL_BODIES_PET_ENTITY_TYPE = "SmolBodiesPet";
const USER_ADDRESS = "0xb013abd83f0bd173e9f14ce7d6e420ad711483b4";

test("smol bodies pets base uri is changed", () => {
  clearStore();

  const baseUri = "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/";
  const baseUriChangedEvent = createBaseUriChangedEvent("", baseUri);

  handleBaseUriChanged(baseUriChangedEvent);
  
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, SMOL_BODIES_PETS_ADDRESS.toHexString(), "baseUri", baseUri);
});

test("smol bodies pet is created with owner", () => {
  clearStore();


  const baseUriChangedEvent = createBaseUriChangedEvent("", "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/");
  handleBaseUriChanged(baseUriChangedEvent);

  const mockTokenData = json.fromBytes(
    Bytes.fromUTF8(`
      {
        "name": "#1",
        "description": "Smol Pet Frens for Smol Bodies",
        "image": "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/1.gif",
        "attributes": [
          {
            "trait_type": "Background",
            "value": "Green"
          },
          {
            "trait_type": "Color",
            "value": "Grey"
          }
        ]
      }
    `)
  );

  const tokenId = 1;
  const smolPetMintEvent = createSmolPetMintEvent(
    USER_ADDRESS,
    tokenId,
    ""
  );
  handleMint(smolPetMintEvent, mockTokenData.toObject());

  // Assert collection was created
  const address = SMOL_BODIES_PETS_ADDRESS.toHexString();
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "id", address);

  // Assert token was created
  const id = `${address}-0x1`;
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "tokenId", "1");
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "owner", USER_ADDRESS);
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "name", "Smol Bodies Pets #1");
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "description", "Smol Pet Frens for Smol Bodies");
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "image", "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/1.gif");

  // Assert related attributes were created
  const backgroundAttributeId = `${address.toLowerCase()}-background-green`;
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "collection", address);
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "name", "Background");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "value", "Green");

  const colorAttributeId = `${address.toLowerCase()}-color-grey`;
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "collection", address);
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "name", "Color");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "value", "Grey");

  // Assert attributes were attached to token
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "attributes", `[${backgroundAttributeId}, ${colorAttributeId}]`);
});
