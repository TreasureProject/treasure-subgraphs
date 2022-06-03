import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS, TREASURE_ADDRESS } from "@treasure/constants";

import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import { handleCraftingFinished } from "../src/mappings/mini-crafting";
import {
  LEGION_INFO_ENTITY_TYPE,
  MINI_CRAFT_ENTITY_TYPE,
  OUTCOME_ENTITY_TYPE,
  USER_ADDRESS,
  createLegionCreatedEvent,
  createLegionTransferEvent,
  createMiniCraftingFinishedEvent,
} from "./helpers";

test("mini crafting outcome is stored", () => {
  clearStore();

  // Finish mini craft
  handleCraftingFinished(
    createMiniCraftingFinishedEvent("1653084615", USER_ADDRESS, 1, 4, 114)
  );

  // Assert MiniCraft entity was created
  const id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";
  assert.fieldEquals(MINI_CRAFT_ENTITY_TYPE, id, "timestamp", "1653084615");
  assert.fieldEquals(MINI_CRAFT_ENTITY_TYPE, id, "tier", "4");
  assert.fieldEquals(
    MINI_CRAFT_ENTITY_TYPE,
    id,
    "token",
    `${LEGION_ADDRESS.toHexString()}-0x1`
  );
  assert.fieldEquals(MINI_CRAFT_ENTITY_TYPE, id, "user", USER_ADDRESS);
  assert.fieldEquals(MINI_CRAFT_ENTITY_TYPE, id, "outcome", id);

  // Assert Outcome entity was created
  assert.fieldEquals(OUTCOME_ENTITY_TYPE, id, "rewardAmount", "1");
  assert.fieldEquals(
    OUTCOME_ENTITY_TYPE,
    id,
    "reward",
    `${TREASURE_ADDRESS.toHexString()}-0x72`
  );
  assert.fieldEquals(OUTCOME_ENTITY_TYPE, id, "success", "true");
});

test("mini crafting increases xp when emitted", () => {
  clearStore();

  // Mint & create Legion
  handleTransfer(
    createLegionTransferEvent(Address.zero().toHexString(), USER_ADDRESS, 1)
  );
  handleLegionCreated(createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2));

  // Finish mini craft
  handleCraftingFinished(
    createMiniCraftingFinishedEvent("1653084615", USER_ADDRESS, 1, 4, 114, 20)
  );

  // Assert Legion crafting XP was increased
  assert.fieldEquals(
    LEGION_INFO_ENTITY_TYPE,
    `${LEGION_ADDRESS.toHexString()}-0x1-metadata`,
    "craftingXp",
    "20"
  );
});
