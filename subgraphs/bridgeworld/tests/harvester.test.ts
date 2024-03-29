import { assert, describe, test } from "matchstick-as";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Harvester } from "../generated/schema";
import { calculateHarvesterPartsBoost } from "../src/helpers/harvester";

describe("harvesters", () => {
  test("that partially full parts boost is calculated", () => {
    const harvester = new Harvester(Address.zero());
    harvester.maxPartsStaked = 800;
    harvester.partsBoostFactor = BigInt.fromString("500000000000000000");
    harvester.partsStaked = 200;
    assert.bigIntEquals(
      BigInt.fromString("218750000000000000"),
      calculateHarvesterPartsBoost(harvester)
    );
  });

  test("that full parts boost is calculated", () => {
    const harvester = new Harvester(Address.zero());
    harvester.maxPartsStaked = 800;
    harvester.partsBoostFactor = BigInt.fromString("500000000000000000");
    harvester.partsStaked = 800;
    assert.bigIntEquals(
      BigInt.fromString("500000000000000000"),
      calculateHarvesterPartsBoost(harvester)
    );
  });
});
