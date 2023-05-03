import { assert, describe, test } from "matchstick-as";

import { BigInt } from "@graphprotocol/graph-ts";

import { timestampToDate } from "../src/helpers";

describe("timestampToDate", () => {
  test("should create start of date id", () => {
    const timestamp = BigInt.fromString("1683150545");
    const date = timestampToDate(timestamp);
    assert.bigIntEquals(BigInt.fromString("1683072000"), date);
  });
});
