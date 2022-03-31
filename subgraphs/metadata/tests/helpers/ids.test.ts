import { assert, test } from "matchstick-as/assembly/index";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Collection } from "../../generated/schema";
import {
  getAttributeId,
  getCollectionId,
  getTokenId,
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
  assert.stringEquals(id, "test-collection-test name-value");
});
