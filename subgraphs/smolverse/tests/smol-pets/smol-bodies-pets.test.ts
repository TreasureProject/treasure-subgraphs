import { assert, clearStore, test } from "matchstick-as/assembly/index";

import { createBaseUriChangedEvent, createSmolPetMintEvent, createTransferEvent } from "./utils";
import { handleBaseUriChanged, handleMint, handleTransfer } from "../../src/mappings/smol-pets";
import { BigDecimal, Bytes, json } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";
import { Attribute } from "../../generated/schema";

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
  
  assert.fieldEquals(COLLECTION_ENTITY_TYPE, baseUriChangedEvent.address.toHexString(), "baseUri", baseUri);
});

// TODO: uncomment tests when Matchstick supports ipfs.cat

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
//   const address = smolPetMintEvent.address.toHexString();
//   assert.fieldEquals(COLLECTION_ENTITY_TYPE, address, "id", address);

//   // Assert token was created
//   const id = `${address}-0x1`;
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "tokenId", "1");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "owner", USER_ADDRESS);
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Smol Bodies Pets #1");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Pet Frens for Smol Bodies");
//   assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/1.gif");

//   // Assert related attributes were created
//   const backgroundAttributeId = `${address}-background-green`;
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "collection", address);
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "name", "Background");
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, backgroundAttributeId, "value", "Green");

//   const colorAttributeId = `${address}-color-grey`;
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
//   const address = smolPetMintEvent.address.toHexString();
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

// test("attribute percentages are updated with mints", () => {
//   clearStore();

//   const baseUriChangedEvent = createBaseUriChangedEvent("", "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/");
//   handleBaseUriChanged(baseUriChangedEvent);

//   handleMint(
//     createSmolPetMintEvent(USER_ADDRESS, 1, ""),
//     mockTokenData.toObject()
//   );

//   handleMint(
//     createSmolPetMintEvent(USER_ADDRESS, 2, ""),
//     json.fromBytes(
//       Bytes.fromUTF8(`
//         {
//           "name": "#2",
//           "description": "Smol Pet Frens for Smol Bodies",
//           "image": "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/2.gif",
//           "attributes": [
//             {
//               "trait_type": "Background",
//               "value": "Green"
//             },
//             {
//               "trait_type": "Color",
//               "value": "Black"
//             }
//           ]
//         }
//       `)
//     ).toObject()
//   );

//   handleMint(
//     createSmolPetMintEvent(USER_ADDRESS, 3, ""),
//     json.fromBytes(
//       Bytes.fromUTF8(`
//         {
//           "name": "#3",
//           "description": "Smol Pet Frens for Smol Bodies",
//           "image": "ipfs://Qmak8RVrMWWLEsGtTgVqUJ5a7kkouM2atjyynWT5qQCP2N/3.gif",
//           "attributes": [
//             {
//               "trait_type": "Background",
//               "value": "Green"
//             },
//             {
//               "trait_type": "Color",
//               "value": "Black"
//             }
//           ]
//         }
//       `)
//     ).toObject()
//   );

//   // Assert attribute percentages
//   // 3/3 have background green
//   // 1/3 has color grey
//   // 2/3 have color black
//   const address = baseUriChangedEvent.address.toHexString();
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, `${address}-background-green`, "percentage", "1");
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, `${address}-color-grey`, "percentage", "0.3333333333");
//   assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, `${address}-color-black`, "percentage", "0.6666666666");
// });

// test("attribute percentages not updated until threshold is met", () => {
//   clearStore();

//   const baseUriChangedEvent = createBaseUriChangedEvent("", "ipfs://QmdEC7rjy2WZaTQSXtFtMEN2AvS8ARFvnMhRDcFHvhaohH/");
//   baseUriChangedEvent.address = SMOL_BODIES_PETS_ADDRESS;
//   handleBaseUriChanged(baseUriChangedEvent);

//   const mintEvent = createSmolPetMintEvent(USER_ADDRESS, 1, "");
//   mintEvent.address = baseUriChangedEvent.address;
//   handleMint(mintEvent, mockTokenData.toObject());

//   // Assert attribute percentages were not updated
//   const attribute = Attribute.load(`${mintEvent.address.toHexString()}-background-green`) as Attribute;
//   const percentage = attribute.percentage ? (attribute.percentage as BigDecimal).toString() : "unknown";
//   assert.assertTrue(percentage == "unknown")
// });
