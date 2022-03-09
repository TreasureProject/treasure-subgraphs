import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  handleCraftingFinished,
  handleCraftingRevealed,
  handleCraftingStartedWithDifficulty,
  handleCraftingStartedWithoutDifficulty,
} from "../src/mappings/crafting";
import {
  handleLegionCraftLevelUp,
  handleLegionCreated,
  handleTransfer,
} from "../src/mappings/legion";
import {
  handleRandomRequest,
  handleRandomSeeded,
} from "../src/mappings/randomizer";
import {
  BROKEN_ENTITY_TYPE,
  CRAFTING_ADDRESS,
  CRAFT_ENTITY_TYPE,
  Difficulty,
  LEGION_INFO_ENTITY_TYPE,
  SUMMONING_CIRCLE_ENTITY_TYPE,
  USER_ADDRESS,
  createCraftingFinishedEvent,
  createCraftingRevealedEvent,
  createCraftingStartedEvent,
  createCraftingStartedWithoutDifficultyEvent,
  createLegionCraftLevelUpEvent,
  createLegionCreatedEvent,
  createLegionTransferEvent,
  createRandomRequestEvent,
  createRandomSeededEvent,
} from "./helpers/index";

test("crafting increases xp when completed successfully", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  let craftsToLevelUp = 14;

  // Lets do 14 crafts, then level up to level 2
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStartedWithoutDifficulty(craftStartedEvent);

    assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "crafters", "1");
    assert.fieldEquals(SUMMONING_CIRCLE_ENTITY_TYPE, "only", "summoners", "0");
    assert.fieldEquals(
      SUMMONING_CIRCLE_ENTITY_TYPE,
      "only",
      "successRate",
      "1"
    );

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 2);

      handleLegionCraftLevelUp(craftLevelUp);

      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "2");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 16;

  // Lets do 16 crafts, then level up to level 3
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStartedWithoutDifficulty(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 3);

      handleLegionCraftLevelUp(craftLevelUp);

      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "3");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 8;

  // Lets do 8 crafts, then level up to level 4
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStartedWithoutDifficulty(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 4);

      handleLegionCraftLevelUp(craftLevelUp);

      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "4");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${20 * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  // Lets do 8 crafts, then level up to level 5
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStartedWithoutDifficulty(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 5);

      handleLegionCraftLevelUp(craftLevelUp);

      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "5");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${20 * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 12;

  // Lets do 12 crafts, then level up to level 6 (max)
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStartedWithoutDifficulty(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 6);

      handleLegionCraftLevelUp(craftLevelUp);

      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "6");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${40 * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }
});

test("crafting xp does not increase at max level (6)", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  // Short cut to max level
  const craftLevelUp = createLegionCraftLevelUpEvent(1, 6);

  handleLegionCraftLevelUp(craftLevelUp);

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
    USER_ADDRESS,
    1,
    1
  );

  handleCraftingStartedWithoutDifficulty(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

  handleCraftingRevealed(craftRevealedEvent);

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

  handleCraftingFinished(craftFinishedEvent);
});

test("crafting xp does not increase on failure", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
    USER_ADDRESS,
    1,
    1
  );

  handleCraftingStartedWithoutDifficulty(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(
    USER_ADDRESS,
    1,
    false
  );

  handleCraftingRevealed(craftRevealedEvent);

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

  handleCraftingFinished(craftFinishedEvent);
});

test("crafting works with difficulty parameter", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedEvent(
    USER_ADDRESS,
    1,
    1,
    Difficulty.Medium
  );

  handleCraftingStartedWithDifficulty(craftStartedEvent);

  const craftId = `${CRAFTING_ADDRESS}-0x1`;

  assert.fieldEquals(CRAFT_ENTITY_TYPE, craftId, "difficulty", "Medium");
});

test("crafting does not create broken treasures with amount of zero", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
    USER_ADDRESS,
    1,
    1
  );

  handleCraftingStartedWithoutDifficulty(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(
    USER_ADDRESS,
    1,
    false,
    0,
    1,
    [95],
    [0]
  );

  handleCraftingRevealed(craftRevealedEvent);

  const craftId = `${CRAFTING_ADDRESS}-0x1-0x1`;

  assert.notInStore(BROKEN_ENTITY_TYPE, craftId);
});

test("crafting does not create broken treasures with treasureId of zero", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
    USER_ADDRESS,
    1,
    1
  );

  handleCraftingStartedWithoutDifficulty(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(
    USER_ADDRESS,
    1,
    false,
    0,
    1,
    [0],
    [1]
  );

  handleCraftingRevealed(craftRevealedEvent);

  const craftId = `${CRAFTING_ADDRESS}-0x1-0x1`;

  assert.notInStore(BROKEN_ENTITY_TYPE, craftId);
});

test("crafting handles with multiple broken treasures", () => {
  clearStore();

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  // Perform a craft
  const randomRequestEvent = createRandomRequestEvent(1, 2);

  handleRandomRequest(randomRequestEvent);

  const craftStartedEvent = createCraftingStartedWithoutDifficultyEvent(
    USER_ADDRESS,
    1,
    1
  );

  handleCraftingStartedWithoutDifficulty(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(
    USER_ADDRESS,
    1,
    false,
    0,
    1,
    [68, 77],
    [1, 1]
  );

  handleCraftingRevealed(craftRevealedEvent);

  const craftId = `${CRAFTING_ADDRESS}-0x1-0x1`;

  assert.fieldEquals(
    BROKEN_ENTITY_TYPE,
    `${craftId}-0x${(68).toString(16)}`,
    "quantity",
    "1"
  );

  assert.fieldEquals(
    BROKEN_ENTITY_TYPE,
    `${craftId}-0x${(77).toString(16)}`,
    "quantity",
    "1"
  );
});
