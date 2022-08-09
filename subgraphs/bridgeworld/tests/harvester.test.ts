import { assert, test } from "matchstick-as";

import { BigInt } from "@graphprotocol/graph-ts";

import { Harvester } from "../generated/schema";
import { calculateHarvesterPartsBoost } from "../src/helpers/harvester";

test("parts boost is calculated", () => {
  let harvester = new Harvester("test-harvester1");
  harvester.maxPartsStaked = 800;
  harvester.partsBoostFactor = BigInt.fromString("500000000000000000");
  harvester.partsStaked = 200;
  assert.bigIntEquals(
    BigInt.fromString("218750000000000000"),
    calculateHarvesterPartsBoost(harvester)
  );

  harvester = new Harvester("test-harvester2");
  harvester.maxPartsStaked = 800;
  harvester.partsBoostFactor = BigInt.fromString("500000000000000000");
  harvester.partsStaked = 800;
  assert.bigIntEquals(
    BigInt.fromString("500000000000000000"),
    calculateHarvesterPartsBoost(harvester)
  );
});
