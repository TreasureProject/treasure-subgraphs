import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { getOrCreateRecruitConfig } from "../src/helpers/recruit";
import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import {
  handleAscensionInfoSet,
  handleLevelUpInfoSet,
  handleMaxLevelSet,
  handleRecruitTypeChanged,
  handleRecruitXpChanged,
} from "../src/mappings/recruit";
import {
  LEGION_INFO_ENTITY_TYPE,
  RECRUIT_CONFIG_ENTITY_TYPE,
  RECRUIT_LEVEL_CONFIG_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "./helpers/constants";
import {
  createLegionCreatedEvent,
  createLegionTransferEvent,
} from "./helpers/legion";
import {
  createAscensionInfoSetEvent,
  createLevelUpInfoSetEvent,
  createMaxLevelSetEvent,
  createRecruitTypeChangedEvent,
  createRecruitXpChangedEvent,
} from "./helpers/recruit";

test("that recruit config has default values and can be updated", () => {
  clearStore();

  // Create default config and assert default values
  getOrCreateRecruitConfig();
  assert.fieldEquals(RECRUIT_CONFIG_ENTITY_TYPE, "only", "maxLevel", "8");
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionMinLevel",
    "3"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionCostEssenceOfStarlight",
    "6"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionCostPrismShards",
    "6"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionMinLevel",
    "7"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionCostEssenceOfStarlight",
    "12"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionCostPrismShards",
    "12"
  );

  // Update max level and assert value was updated
  handleMaxLevelSet(createMaxLevelSetEvent(9));
  assert.fieldEquals(RECRUIT_CONFIG_ENTITY_TYPE, "only", "maxLevel", "9");

  // Update ascension info and assert values were updated
  handleAscensionInfoSet(createAscensionInfoSetEvent(4, 10, 10, 6, 20, 20));
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionMinLevel",
    "4"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionCostEssenceOfStarlight",
    "10"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "cadetAscensionCostPrismShards",
    "10"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionMinLevel",
    "6"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionCostEssenceOfStarlight",
    "20"
  );
  assert.fieldEquals(
    RECRUIT_CONFIG_ENTITY_TYPE,
    "only",
    "apprenticeAscensionCostPrismShards",
    "20"
  );
});

test("that recruit level configs can be added", () => {
  clearStore();

  // Update level up info and assert values were added
  handleLevelUpInfoSet(createLevelUpInfoSetEvent(1, 10));
  handleLevelUpInfoSet(createLevelUpInfoSetEvent(2, 20));
  assert.fieldEquals(
    RECRUIT_LEVEL_CONFIG_ENTITY_TYPE,
    "recruit-level-config-1",
    "xpToNextLevel",
    "10"
  );
  assert.fieldEquals(
    RECRUIT_LEVEL_CONFIG_ENTITY_TYPE,
    "recruit-level-config-2",
    "xpToNextLevel",
    "20"
  );
});

test("that recruit xp is changed", () => {
  clearStore();

  // Create Recruit
  const tokenId = 4357;
  handleTransfer(
    createLegionTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      tokenId
    )
  );
  handleLegionCreated(createLegionCreatedEvent(USER_ADDRESS, tokenId, 2, 0, 5));

  // Assert initial metadata values
  const metadata = `${LEGION_ADDRESS.toHexString()}-0x1105-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "0");

  // Update and assert XP
  handleRecruitXpChanged(createRecruitXpChangedEvent(tokenId, 1, 20));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "20");

  // Update and assert level
  handleRecruitXpChanged(createRecruitXpChangedEvent(tokenId, 2, 0));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "2");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "0");
});

test("that recruit type is changed", () => {
  clearStore();

  // Create Recruit
  const tokenId = 4357;
  handleTransfer(
    createLegionTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      tokenId
    )
  );
  handleLegionCreated(createLegionCreatedEvent(USER_ADDRESS, tokenId, 2, 0, 5));

  // Assert initial metadata values
  const id = `${LEGION_ADDRESS.toHexString()}-0x1105`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Recruit");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "generation", "2");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "None");

  const metadata = `${id}-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "None");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Base Recruit");

  // Update and assert types
  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 1));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "None");
  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    metadata,
    "role",
    "Cognition Cadet"
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Recruit");

  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 2));
  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    metadata,
    "role",
    "Parabolics Cadet"
  );
  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 3));

  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    metadata,
    "role",
    "Lethality Cadet"
  );
});
