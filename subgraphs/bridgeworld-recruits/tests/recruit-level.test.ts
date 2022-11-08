import { assert, beforeEach, clearStore, test } from "matchstick-as";

import { CONFIG_ID, getOrCreateConfig } from "../src/helpers";
import {
  handleAscensionInfoSet,
  handleLevelUpInfoSet,
  handleMaxLevelSet,
} from "../src/recruit-level";
import {
  createAscensionInfoSetEvent,
  createLevelUpInfoSetEvent,
  createMaxLevelSetEvent,
} from "./helpers/recruit";

const CONFIG_ENTITY_TYPE = "Config";
const LEVEL_CONFIG_ENTITY_TYPE = "LevelConfig";

beforeEach(() => {
  clearStore();
});

test("that recruit config has default values and can be updated", () => {
  // Create default config and assert default values
  getOrCreateConfig();
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "maxLevel",
    "9"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionMinLevel",
    "3"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionCostEssenceOfStarlight",
    "6"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionCostPrismShards",
    "6"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionMinLevel",
    "7"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionCostEssenceOfStarlight",
    "12"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionCostPrismShards",
    "12"
  );

  // Update max level and assert value was updated
  handleMaxLevelSet(createMaxLevelSetEvent(9));
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "maxLevel",
    "9"
  );

  // Update ascension info and assert values were updated
  handleAscensionInfoSet(createAscensionInfoSetEvent(4, 10, 10, 6, 20, 20));
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionMinLevel",
    "4"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionCostEssenceOfStarlight",
    "10"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "cadetAscensionCostPrismShards",
    "10"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionMinLevel",
    "6"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionCostEssenceOfStarlight",
    "20"
  );
  assert.fieldEquals(
    CONFIG_ENTITY_TYPE,
    CONFIG_ID.toHexString(),
    "apprenticeAscensionCostPrismShards",
    "20"
  );
});

test("that recruit level configs can be added", () => {
  // Update level up info and assert values were added
  handleLevelUpInfoSet(createLevelUpInfoSetEvent(1, 10));
  handleLevelUpInfoSet(createLevelUpInfoSetEvent(2, 20));
  assert.fieldEquals(
    LEVEL_CONFIG_ENTITY_TYPE,
    "0x01000000",
    "xpToNextLevel",
    "10"
  );
  assert.fieldEquals(
    LEVEL_CONFIG_ENTITY_TYPE,
    "0x02000000",
    "xpToNextLevel",
    "20"
  );
});
