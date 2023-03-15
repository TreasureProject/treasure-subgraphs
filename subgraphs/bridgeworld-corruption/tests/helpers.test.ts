import { assert, describe, test } from "matchstick-as";

import { Address, Bytes } from "@graphprotocol/graph-ts";

import {
  calculateMaxLegionsInTemple,
  decodeERC1155TokenSetHandlerRequirementData,
  decodeTreasureHandlerRequirementData,
  getOrCreateConfig,
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
        "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000096b273dcb8b4c0aa736694b2580dd3a23762e81900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000650000000000000000000000000000000000000000000000000000000000000066000000000000000000000000000000000000000000000000000000000000006700000000000000000000000000000000000000000000000000000000000000680000000000000000000000000000000000000000000000000000000000000069000000000000000000000000000000000000000000000000000000000000006a"
      )
    );
    assert.assertNotNull(result);
    assert.i32Equals(3, result!.length);
    assert.i32Equals(2, result![0].toI32());
    assert.addressEquals(
      result![1].toAddress(),
      Address.fromString("0x96b273dcb8b4c0aa736694b2580dd3a23762e819")
    );
    const tokenIds = result![2]!.toI32Array();
    assert.i32Equals(7, tokenIds.length);
    assert.i32Equals(100, tokenIds[0]);
    assert.i32Equals(101, tokenIds[1]);
    assert.i32Equals(102, tokenIds[2]);
    assert.i32Equals(103, tokenIds[3]);
    assert.i32Equals(104, tokenIds[4]);
    assert.i32Equals(105, tokenIds[5]);
    assert.i32Equals(106, tokenIds[6]);
  });

  test("that max legions in temple is calculated", () => {
    const config = getOrCreateConfig();
    config.cryptsLegionsActive = 42;
    config.cryptsRoundAdvancePercentage = 60;
    assert.i32Equals(26, calculateMaxLegionsInTemple(config));
  });
});
