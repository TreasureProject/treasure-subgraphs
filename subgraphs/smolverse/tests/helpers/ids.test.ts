import { BigInt } from "@graphprotocol/graph-ts";
import { assert, clearStore, test } from "matchstick-as/assembly/index";

import { Collection } from "../../generated/schema";
import { getAttributeId, getTokenId } from "../../src/helpers/ids";

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
