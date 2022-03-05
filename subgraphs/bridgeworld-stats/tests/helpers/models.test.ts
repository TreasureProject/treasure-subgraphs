import { assert, test } from "matchstick-as";

import { BigInt } from "@graphprotocol/graph-ts";

import { getLegionName } from "../../src/helpers/models";

test("legion name is correct", () => {
  let result = getLegionName(BigInt.fromI32(523), 0, 0);
  assert.stringEquals(result, "Bombmaker");

  result = getLegionName(BigInt.fromI32(1629), 0, 0);
  assert.stringEquals(result, "Warlock");

  result = getLegionName(BigInt.fromI32(1744), 0, 0);
  assert.stringEquals(result, "Fallen");

  result = getLegionName(BigInt.fromI32(2239), 0, 0);
  assert.stringEquals(result, "Dreamwinder");

  result = getLegionName(BigInt.fromI32(3476), 0, 0);
  assert.stringEquals(result, "Clocksnatcher");

  result = getLegionName(BigInt.zero(), 0, 1);
  assert.stringEquals(result, "Genesis Rare");

  result = getLegionName(BigInt.zero(), 0, 2);
  assert.stringEquals(result, "Genesis Special");

  result = getLegionName(BigInt.zero(), 0, 3);
  assert.stringEquals(result, "Genesis Uncommon");

  result = getLegionName(BigInt.zero(), 0, 4);
  assert.stringEquals(result, "Genesis Common");

  result = getLegionName(BigInt.zero(), 1, 3);
  assert.stringEquals(result, "Auxiliary Uncommon");

  result = getLegionName(BigInt.zero(), 2, 5);
  assert.stringEquals(result, "Recruit");
});
