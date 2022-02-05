import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import { createBaseUriChangedEvent, createSmolPetMintEvent, createTransferEvent } from "./utils";
import { handleBaseUriChanged, handleMint, handleTransfer } from "../../src/mappings/smol-bodies-pet";
import { Bytes, json } from "@graphprotocol/graph-ts";

const COLLECTION_ENTITY_TYPE = "Collection";
const ATTRIBUTE_ENTITY_TYPE = "Attribute";
const TOKEN_ENTITY_TYPE = "Token";
const USER_ADDRESS = "0xb013abd83f0bd173e9f14ce7d6e420ad711483b4";
const NEW_USER_ADDRESS = "0x956c2fb042a722359503b59429718d2d5be13b08";

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

test("collection base uri is changed", () => {
  clearStore();

  const baseUri = "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/";
  const baseUriChangedEvent = createBaseUriChangedEvent("", baseUri);

  handleBaseUriChanged(baseUriChangedEvent);
  
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, SMOL_BODIES_PETS_ADDRESS.toHexString(), "baseUri", baseUri);
});

// test("token is created with owner and attributes", () => {
//   clearStore();
  
//   const baseUriChangedEvent = createBaseUriChangedEvent("", "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/");
//   handleBaseUriChanged(baseUriChangedEvent);

//   const tokenId = 1;
//   const smolPetMintEvent = createSmolPetMintEvent(
//     USER_ADDRESS,
//     tokenId,
//     ""
//   );
//   handleMint(smolPetMintEvent, mockTokenData.toObject());

//   // Assert collection was created
//   const address = SMOL_BODIES_PETS_ADDRESS.toHexString();
//   assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "id", address);

//   // Assert token was created
//   const id = `${address}-0x1`;
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "1");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owner", USER_ADDRESS);
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Smol Bodies Pets #1");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Pet Frens for Smol Bodies");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/1.gif");

//   // Assert related attributes were created
//   const backgroundAttributeId = `${address.toLowerCase()}-background-green`;
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "collection", address);
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "name", "Background");
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "value", "Green");

//   const colorAttributeId = `${address.toLowerCase()}-color-grey`;
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "collection", address);
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "name", "Color");
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, colorAttributeId, "value", "Grey");

//   // Assert attributes were attached to token
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "attributes", `[${backgroundAttributeId}, ${colorAttributeId}]`);
// });

// test("token is transfered", () => {
//   clearStore();
  
//   const baseUriChangedEvent = createBaseUriChangedEvent("", "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/");
//   handleBaseUriChanged(baseUriChangedEvent);

//   const tokenId = 1;
//   const smolPetMintEvent = createSmolPetMintEvent(
//     USER_ADDRESS,
//     tokenId,
//     ""
//   );
//   handleMint(smolPetMintEvent, mockTokenData.toObject());

//   // Assert current owner
//   const address = SMOL_BODIES_PETS_ADDRESS.toHexString();
//   const id = `${address}-0x1`;
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owner", USER_ADDRESS);

//   const transferEvent = createTransferEvent(
//     USER_ADDRESS,
//     NEW_USER_ADDRESS,
//     tokenId,
//   );
//   handleTransfer(transferEvent);

//   // Assert new owner
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owner", NEW_USER_ADDRESS);
// });
