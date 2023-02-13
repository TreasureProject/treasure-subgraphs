import { assert, test } from "matchstick-as";

import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { decodeBigIntArray } from "../src/helpers";

test("data is decoded to bigints", () => {
  const data =
    "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000002";
  const result = decodeBigIntArray(Bytes.fromHexString(data));
  assert.i32Equals(result.length, 4);
  assert.bigIntEquals(result[0], BigInt.fromI32(2));
  assert.bigIntEquals(result[1], BigInt.fromI32(4));
  assert.bigIntEquals(result[2], BigInt.fromI32(5));
  assert.bigIntEquals(result[3], BigInt.fromI32(2));
});
