import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";

import { Collection } from "../../generated/schema";
import {
  getAttributeId,
  getCollectionId,
  getRandomId,
  getSeededId,
  getStakedTokenId,
  getTokenId
} from "../../src/helpers/ids";

test("collection unique id is generated", () => {
  const id = getCollectionId(Address.zero());
  assert.stringEquals(id, "0x0000000000000000000000000000000000000000");
});

test("token unique id is generated", () => {
  const collection = new Collection("test-collection");
  const id = getTokenId(collection, BigInt.fromI32(1));
  assert.stringEquals(id, "test-collection-0x1");
});

test("attribute unique id is generated", () => {
  const collection = new Collection("test-collection");
  const id = getAttributeId(collection, "Test Name", "Value");
  assert.stringEquals(id, "test-collection-test-name-value");
});

test("staked token unique id is generated", () => {
  const id = getStakedTokenId("collection", BigInt.fromI32(1), "Farm");
  assert.stringEquals(id, "collection-0x1-farm");
});

test("random unique id is generated", () => {
  const id = getRandomId(BigInt.fromI32(1234));
  assert.stringEquals(id, "0x4d2");
});

test("seeded unique id is generated", () => {
  const id = getSeededId(BigInt.fromI32(1234));
  assert.stringEquals(id, "0x4d2");
});
