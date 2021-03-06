import { assert, clearStore, createMockedFunction, test } from "matchstick-as";

import {
  Address,
  BigDecimal,
  Bytes,
  ethereum,
  json,
} from "@graphprotocol/graph-ts";

import { SMOL_BODIES_ADDRESS, SWOLERCYCLES_ADDRESS } from "@treasure/constants";

import { Attribute, Collection, Token } from "../../generated/schema";
import { updateTokenMetadata } from "../../src/helpers/metadata";
import { handleTransfer } from "../../src/mappings/smol-bodies";
import { handleTransfer as handleSwolercycleTransfer } from "../../src/mappings/swolercycles";
import { createTransferEvent } from "../smol-bodies/utils";
import { createTransferEvent as createSwolercycleTransferEvent } from "../swolercycles/utils";
import {
  ATTRIBUTE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";

createMockedFunction(Address.zero(), "baseURI", "baseURI():(string)").returns([
  ethereum.Value.fromString("test"),
]);

createMockedFunction(
  SMOL_BODIES_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString("test")]);

createMockedFunction(
  SWOLERCYCLES_ADDRESS,
  "baseURI",
  "baseURI():(string)"
).returns([ethereum.Value.fromString("test")]);

const mockTokenData = json
  .fromBytes(
    Bytes.fromUTF8(`
    {
      "name": "#1",
      "description": "Smol Bodies",
      "image": "test-image",
      "video": "test-video",
      "attributes": [
        {
          "trait_type": "Gender",
          "value": "male"
        },
        {
          "trait_type": "Swol Size",
          "value": 0
        }
      ]
    }
  `)
  )
  .toObject();

const mockSwolercycleTokenData = json
  .fromBytes(
    Bytes.fromUTF8(`
    {
      "name": "Cycle #1",
      "description": "Swolercycles",
      "image": "test-image",
      "attributes": [
        {
          "trait_type": "Backgrounds",
          "value": "Punk Garage"
        },
        {
          "trait_type": "Wheel Color",
          "value": "Green"
        }
      ]
    }
  `)
  )
  .toObject();

test("token attributes are set", () => {
  clearStore();

  const address = SMOL_BODIES_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x1`;
  const collection = Collection.load(address) as Collection;
  const token = Token.load(id) as Token;
  updateTokenMetadata(collection, token, mockTokenData);

  // Assert token metadata was saved
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Smol Bodies #1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Bodies");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "test-image");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "video", "test-video");

  // Assert related attributes were created
  const attributeId1 = `${address}-gender-male`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId1,
    "collection",
    address
  );
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "name", "Gender");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "value", "male");

  const attributeId2 = `${address}-swol-size-0`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId2,
    "collection",
    address
  );
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "name", "Swol Size");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "value", "0");

  // Assert attributes were attached to token
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "attributes",
    `[${attributeId1}, ${attributeId2}]`
  );
});

test("token attributes are set without collection name in token name", () => {
  clearStore();

  const address = SWOLERCYCLES_ADDRESS.toHexString();
  const transferEvent = createSwolercycleTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleSwolercycleTransfer(transferEvent);

  const id = `${address}-0x1`;
  const collection = Collection.load(address) as Collection;
  const token = Token.load(id) as Token;
  updateTokenMetadata(collection, token, mockSwolercycleTokenData);

  // Assert token metadata was saved
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Cycle #1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Swolercycles");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "test-image");

  // Assert related attributes were created
  const attributeId1 = `${address}-backgrounds-punk-garage`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId1,
    "collection",
    address
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId1,
    "name",
    "Backgrounds"
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId1,
    "value",
    "Punk Garage"
  );

  const attributeId2 = `${address}-wheel-color-green`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId2,
    "collection",
    address
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId2,
    "name",
    "Wheel Color"
  );
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "value", "Green");

  // Assert attributes were attached to token
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "attributes",
    `[${attributeId1}, ${attributeId2}]`
  );
});

test("token attribute percentages are set", () => {
  clearStore();

  const address = Address.zero().toHexString();
  const transferEvent1 = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  transferEvent1.address = Address.zero();
  handleTransfer(transferEvent1);

  const transferEvent2 = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    2
  );
  transferEvent2.address = Address.zero();
  handleTransfer(transferEvent2);

  const transferEvent3 = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    3
  );
  transferEvent3.address = Address.zero();
  handleTransfer(transferEvent3);

  const collection = Collection.load(address) as Collection;
  const token1 = Token.load(`${address}-0x1`) as Token;
  const token2 = Token.load(`${address}-0x2`) as Token;
  const token3 = Token.load(`${address}-0x3`) as Token;

  updateTokenMetadata(
    collection,
    token1,
    json
      .fromBytes(
        Bytes.fromUTF8(`
      {
        "name": "#1",
        "description": "Smol Bodies",
        "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/2/0.png",
        "attributes": [
          {
            "trait_type": "Gender",
            "value": "male"
          },
          {
            "trait_type": "Background",
            "value": "dojo"
          }
        ]
      }
    `)
      )
      .toObject()
  );

  updateTokenMetadata(
    collection,
    token2,
    json
      .fromBytes(
        Bytes.fromUTF8(`
      {
        "name": "#2",
        "description": "Smol Bodies",
        "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/2/0.png",
        "attributes": [
          {
            "trait_type": "Gender",
            "value": "male"
          },
          {
            "trait_type": "Background",
            "value": "alley"
          }
        ]
      }
    `)
      )
      .toObject()
  );

  updateTokenMetadata(
    collection,
    token3,
    json
      .fromBytes(
        Bytes.fromUTF8(`
      {
        "name": "#3",
        "description": "Smol Bodies",
        "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/3/0.png",
        "attributes": [
          {
            "trait_type": "Gender",
            "value": "female"
          },
          {
            "trait_type": "Background",
            "value": "gym"
          }
        ]
      }
    `)
      )
      .toObject()
  );

  // Assert attribute percentages
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-gender-male`,
    "percentage",
    "0.6666666666"
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-gender-female`,
    "percentage",
    "0.3333333333"
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-background-dojo`,
    "percentage",
    "0.3333333333"
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-background-alley`,
    "percentage",
    "0.3333333333"
  );
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-background-gym`,
    "percentage",
    "0.3333333333"
  );
});

test("token attribute percentages are not set until threshold is met", () => {
  clearStore();

  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const collection = Collection.load(
    transferEvent.address.toHexString()
  ) as Collection;
  const token = Token.load(
    `${transferEvent.address.toHexString()}-0x1`
  ) as Token;
  updateTokenMetadata(collection, token, mockTokenData);

  // Assert attribute percentages were not updated
  const attribute = Attribute.load(
    `${transferEvent.address.toHexString()}-gender-male`
  ) as Attribute;
  const percentage = attribute.percentage
    ? (attribute.percentage as BigDecimal).toString()
    : "unknown";
  assert.assertTrue(percentage == "unknown");
});
