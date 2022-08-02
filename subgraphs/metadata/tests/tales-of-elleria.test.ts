import {
  assert,
  clearStore,
  createMockedFunction,
  newMockEvent,
  test,
} from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { TALES_OF_ELLERIA_ADDRESS } from "@treasure/constants";

import { AttributeChange } from "../generated/Tales of Elleria Data/TalesOfElleria";
import { Transfer } from "../generated/Tales of Elleria/ERC721";
import {
  handleAttributeChange,
  handleTransfer,
} from "../src/mappings/tales-of-elleria";
import {
  ATTRIBUTE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "./utils";

export const TALES_OF_ELLERIA_DATA_ADDRESS = Address.fromString(
  "0x461950b159366edcd2bcbee8126d973ac4928888"
);

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = TALES_OF_ELLERIA_ADDRESS;
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return event;
};

export const createAttributeChangeEvent = (
  from: string,
  tokenId: i32,
  strength: i32,
  agility: i32,
  vitality: i32,
  endurance: i32,
  intelligence: i32,
  will: i32,
  class_: i32
): AttributeChange => {
  const event = changetype<AttributeChange>(newMockEvent());

  event.address = TALES_OF_ELLERIA_DATA_ADDRESS;
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
    new ethereum.EventParam("strength", ethereum.Value.fromI32(strength)),
    new ethereum.EventParam("agility", ethereum.Value.fromI32(agility)),
    new ethereum.EventParam("vitality", ethereum.Value.fromI32(vitality)),
    new ethereum.EventParam("endurance", ethereum.Value.fromI32(endurance)),
    new ethereum.EventParam(
      "intelligence",
      ethereum.Value.fromI32(intelligence)
    ),
    new ethereum.EventParam("will", ethereum.Value.fromI32(will)),
    new ethereum.EventParam("class_", ethereum.Value.fromI32(class_)),
  ];

  return event;
};

createMockedFunction(
  TALES_OF_ELLERIA_ADDRESS,
  "tokenURI",
  "tokenURI(uint256):(string)"
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
  .returns([
    ethereum.Value.fromString(
      "0;https://ipfs.moralis.io:2053/ipfs/Qmaz7KeBF4sEHZbdQ1pfuBG9qWhsxF2xMJ72CbdW1Tbcr1;84;94;75;25;25;5;308;2;Assassin;1;0;1648214189;0;0"
    ),
  ]);

createMockedFunction(
  TALES_OF_ELLERIA_ADDRESS,
  "tokenURI",
  "tokenURI(uint256):(string)"
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
  .returns([
    ethereum.Value.fromString(
      "1;https://ipfs.moralis.io:2053/ipfs/Qmaz7KeBF4sEHZbdQ1pfuBG9qWhsxF2xMJ72CbdW1Tbcr1;84;94;75;25;25;5;308;2;Assassin;1;0;1648214189;0;0"
    ),
  ]);

createMockedFunction(
  TALES_OF_ELLERIA_ADDRESS,
  "tokenURI",
  "tokenURI(uint256):(string)"
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
  .returns([
    ethereum.Value.fromString(
      "2;https://ipfs.moralis.io:2053/ipfs/Qmaz7KeBF4sEHZbdQ1pfuBG9qWhsxF2xMJ72CbdW1Tbcr1;84;94;75;25;25;5;308;2;Assassin;1;0;1648214189;0;0"
    ),
  ]);

test("token attributes are set", () => {
  clearStore();

  const address = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Hero #1");
});

test("jester token is correct", () => {
  clearStore();

  const address = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    2
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x2`;

  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-rarity-jester`,
    "tokens",
    `[${id}]`
  );

  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    "https://ipfs.moralis.io:2053/ipfs/QmdvJr2XjPoepJoxT8kH6RGJeuxopCpC2JahQfrtGATdkE"
  );
});

test("plague doctor token is correct", () => {
  clearStore();

  const address = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    0
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x0`;

  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    `${address}-rarity-plague doctor`,
    "tokens",
    `[${id}]`
  );

  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    "https://ipfs.moralis.io:2053/ipfs/QmafevGMgE4pTF1Z3UjL3PBm2SZqj3ZSK6Hue7iKte5Rk1"
  );
});

test("token attributes are updated", () => {
  clearStore();

  const address = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Hero #1");

  const attributeChangeEvent = createAttributeChangeEvent(
    USER_ADDRESS,
    1,
    84,
    95,
    75,
    25,
    25,
    5,
    2
  );

  handleAttributeChange(attributeChangeEvent);
});
