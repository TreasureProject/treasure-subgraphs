import { assert, beforeEach, clearStore, describe, test } from "matchstick-as";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Harvester } from "../generated/schema";
import {
  calculateHarvesterLegionsBoost,
  calculateHarvesterPartsBoost,
} from "../src/helpers/harvester";

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

  test("that partially full legions boost is calculated", () => {
    const harvester = new Harvester(Address.zero());
    harvester.legionsStaked = 3;
    harvester.maxLegionsStaked = 1000;
    harvester.legionsTotalRank = BigInt.fromString("3300000000000000000");
    assert.bigIntEquals(
      BigInt.fromString("6050910000000000"),
      calculateHarvesterLegionsBoost(harvester)
    );
  });

  test("that full legions boost is calculated", () => {
    const harvester = new Harvester(Address.zero());
    harvester.legionsStaked = 1320;
    harvester.maxLegionsStaked = 1000;
    harvester.legionsTotalRank = BigInt.fromString("1926800000000000000000");
    assert.bigIntEquals(
      BigInt.fromString("1045969696969696969"),
      calculateHarvesterLegionsBoost(harvester)
    );
  });
});
