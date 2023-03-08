import { assert, describe, test } from "matchstick-as";

import { Address, Bytes } from "@graphprotocol/graph-ts";

import {
  decodeERC1155TokenSetHandlerRequirementData,
  decodeTreasureHandlerRequirementData,
} from "../src/helpers";

describe("corruption helpers", () => {
  test("that treasure corruption handler data is decoded", () => {
    const result = decodeTreasureHandlerRequirementData(
      Bytes.fromHexString(
        "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002"
      )
    );
    assert.assertNotNull(result);
    assert.i32Equals(2, result!.length);
    assert.i32Equals(1, result![0]);
    assert.i32Equals(2, result![1]);
  });

  test("that erc1155 token set corruption handler data is decoded", () => {
    const result = decodeERC1155TokenSetHandlerRequirementData(
      Bytes.fromHexString(
        "0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000096b273dcb8b4c0aa736694b2580dd3a23762e81900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000650000000000000000000000000000000000000000000000000000000000000066000000000000000000000000000000000000000000000000000000000000006700000000000000000000000000000000000000000000000000000000000000680000000000000000000000000000000000000000000000000000000000000069000000000000000000000000000000000000000000000000000000000000006a"
      )
    );
    assert.assertNotNull(result);
    assert.i32Equals(result!.length, 3);
    assert.i32Equals(result![0].toI32(), 2);
    assert.addressEquals(
      result![1].toAddress(),
      Address.fromString("0x96b273dcb8b4c0aa736694b2580dd3a23762e819")
    );
    const tokenIds = result![2]!.toI32Array().slice(2);
    assert.i32Equals(tokenIds.length, 7);
    assert.i32Equals(tokenIds[0], 100);
    assert.i32Equals(tokenIds[1], 101);
    assert.i32Equals(tokenIds[2], 102);
    assert.i32Equals(tokenIds[3], 103);
    assert.i32Equals(tokenIds[4], 104);
    assert.i32Equals(tokenIds[5], 105);
    assert.i32Equals(tokenIds[6], 106);
  });
});
