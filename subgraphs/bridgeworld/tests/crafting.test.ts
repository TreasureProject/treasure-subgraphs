import { assert, clearStore, test } from "matchstick-as/assembly";

import {
  LEGION_INFO_ENTITY_TYPE,
  USER_ADDRESS,
  createLegionCreatedEvent,
  createLegionCraftLevelUpEvent,
  createLegionTransferEvent,
  createCraftingStartedEvent,
  createCraftingRevealedEvent,
  createCraftingFinishedEvent,
  createRandomRequestEvent,
  createRandomSeededEvent,
} from "./helpers/index";

import { Address } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import {
  handleLegionCreated,
  handleLegionCraftLevelUp,
  handleTransfer,
} from "../src/mappings/legion";
import {
  handleCraftingFinished,
  handleCraftingRevealed,
  handleCraftingStarted,
} from "../src/mappings/crafting";
import {
  handleRandomRequest,
  handleRandomSeeded,
} from "../src/mappings/randomizer";

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

  let craftsToLevelUp = 10;
  let craftingLevel = 1;

  // Lets do 10 crafts, then level up to level 2
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStarted(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 2);

      handleLegionCraftLevelUp(craftLevelUp);
    }

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "2");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * craftingLevel * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftingLevel = 2;

  // Lets do 10 crafts, then level up to level 3
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStarted(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 3);

      handleLegionCraftLevelUp(craftLevelUp);
    }

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "3");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * craftingLevel * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 14;
  craftingLevel = 3;

  // Lets do 14 crafts, then level up to level 4
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStarted(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 4);

      handleLegionCraftLevelUp(craftLevelUp);
    }

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "4");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * craftingLevel * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 38;
  craftingLevel = 4;

  // Lets do 38 crafts, then level up to level 5
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStarted(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 5);

      handleLegionCraftLevelUp(craftLevelUp);
    }

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "5");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * craftingLevel * index}`
      );
    }

    const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

    handleCraftingFinished(craftFinishedEvent);
  }

  craftsToLevelUp = 50;
  craftingLevel = 5;

  // Lets do 50 crafts, then level up to level 6 (max)
  for (let index = 1; index < craftsToLevelUp + 1; index++) {
    const randomRequestEvent = createRandomRequestEvent(index, index + 1);

    handleRandomRequest(randomRequestEvent);

    const craftStartedEvent = createCraftingStartedEvent(
      USER_ADDRESS,
      1,
      index
    );

    handleCraftingStarted(craftStartedEvent);

    const randomSeededEvent = createRandomSeededEvent(index + 1);

    handleRandomSeeded(randomSeededEvent);

    if (index === craftsToLevelUp) {
      // Level up on reveal
      const craftLevelUp = createLegionCraftLevelUpEvent(1, 6);

      handleLegionCraftLevelUp(craftLevelUp);
    }

    const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1);

    handleCraftingRevealed(craftRevealedEvent);

    if (index === craftsToLevelUp) {
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "6");
      assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
    } else {
      assert.fieldEquals(
        LEGION_INFO_ENTITY_TYPE,
        metadata,
        "craftingXp",
        `${10 * craftingLevel * index}`
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

  const craftStartedEvent = createCraftingStartedEvent(USER_ADDRESS, 1, 1);

  handleCraftingStarted(craftStartedEvent);

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

  const craftStartedEvent = createCraftingStartedEvent(USER_ADDRESS, 1, 1);

  handleCraftingStarted(craftStartedEvent);

  const randomSeededEvent = createRandomSeededEvent(2);

  handleRandomSeeded(randomSeededEvent);

  const craftRevealedEvent = createCraftingRevealedEvent(USER_ADDRESS, 1, false);

  handleCraftingRevealed(craftRevealedEvent);

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");

  const craftFinishedEvent = createCraftingFinishedEvent(USER_ADDRESS, 1);

  handleCraftingFinished(craftFinishedEvent);
});