import {
  assert,
  beforeEach,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly";

import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { setQuestingXpGainedBlockNumberIfEmpty } from "../src/helpers/config";
import {
  handleLegionCreated,
  handleLegionQuestLevelUp,
  handleTransfer,
} from "../src/mappings/legion";
import {
  handleQuestFinished,
  handleQuestRevealed,
  handleQuestStartedWithDifficulty,
  handleQuestStartedWithoutDifficulty,
  handleQuestXpGained,
} from "../src/mappings/questing";
import {
  Difficulty,
  LEGION_INFO_ENTITY_TYPE,
  QUESTING_ADDRESS,
  QUEST_ENTITY_TYPE,
  USER_ADDRESS,
} from "./helpers/constants";
import {
  createLegionCreatedEvent,
  createLegionQuestLevelUpEvent,
  createLegionTransferEvent,
} from "./helpers/legion";
import {
  createQuestFinishedEvent,
  createQuestRevealedEvent,
  createQuestStartedEvent,
  createQuestStartedWithoutDifficultyEvent,
  createQuestXpGainedEvent,
} from "./helpers/questing";

describe("questing", () => {
  const TOKEN_ID = 1;

  beforeEach(() => {
    clearStore();

    handleTransfer(
      createLegionTransferEvent(
        Address.zero().toHexString(),
        USER_ADDRESS,
        TOKEN_ID
      )
    );

    handleLegionCreated(
      createLegionCreatedEvent(USER_ADDRESS, TOKEN_ID, 0, 6, 2)
    );

    const legionMetadataId = `${LEGION_ADDRESS.toHexString()}-0x1-metadata`;
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questing",
      "1"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "0"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsCompleted",
      "0"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsDistanceTravelled",
      "0"
    );
  });

  test("questing increases xp when completed", () => {
    const legionMetadataId = `${LEGION_ADDRESS.toHexString()}-0x1-metadata`;

    let questsToLevelUp = 10;

    // Lets do 10 quests, then level up to level 2
    for (let index = 1; index < questsToLevelUp + 1; index++) {
      handleQuestStartedWithoutDifficulty(
        createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, index)
      );

      handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

      if (index === questsToLevelUp) {
        // Level up on reveal
        handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 2));
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questing",
          "2"
        );
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          "0"
        );
      } else {
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          `${10 * index}`
        );
      }

      handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    }

    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsCompleted",
      questsToLevelUp.toString()
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsDistanceTravelled",
      (questsToLevelUp * 10).toString()
    );

    questsToLevelUp = 20;

    // Lets do 20 quests, then level up to level 3
    for (let index = 1; index < questsToLevelUp + 1; index++) {
      handleQuestStartedWithoutDifficulty(
        createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, index)
      );

      handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

      if (index === questsToLevelUp) {
        // Level up on reveal
        handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 3));
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questing",
          "3"
        );
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          "0"
        );
      } else {
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          `${10 * index}`
        );
      }

      handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    }

    questsToLevelUp = 25;

    // Lets do 25 quests, then level up to level 4
    for (let index = 1; index < questsToLevelUp + 1; index++) {
      handleQuestStartedWithoutDifficulty(
        createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, index)
      );

      handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

      if (index === questsToLevelUp) {
        // Level up on reveal
        handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 4));
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questing",
          "4"
        );
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          "0"
        );
      } else {
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          `${20 * index}`
        );
      }

      handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    }

    questsToLevelUp = 50;

    // Lets do 50 quests, then level up to level 5
    for (let index = 1; index < questsToLevelUp + 1; index++) {
      handleQuestStartedWithoutDifficulty(
        createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, index)
      );

      handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

      if (index === questsToLevelUp) {
        // Level up on reveal
        handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 5));
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questing",
          "5"
        );
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          "0"
        );
      } else {
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          `${20 * index}`
        );
      }

      handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    }

    // Lets do 50 quests, then level up to level 6 (max)
    for (let index = 1; index < questsToLevelUp + 1; index++) {
      handleQuestStartedWithoutDifficulty(
        createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, index)
      );

      handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

      if (index === questsToLevelUp) {
        // Level up on reveal
        handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 6));
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questing",
          "6"
        );
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          "0"
        );
      } else {
        assert.fieldEquals(
          LEGION_INFO_ENTITY_TYPE,
          legionMetadataId,
          "questingXp",
          `${40 * index}`
        );
      }

      handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    }
  });

  test("questing xp does not increase at max level (6)", () => {
    // Short cut to max level
    handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(1, 6));

    // Perform a craft
    handleQuestStartedWithoutDifficulty(
      createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, 1)
    );

    const legionMetadataId = `${LEGION_ADDRESS.toHexString()}-0x1-metadata`;
    assert.fieldEquals(
      QUEST_ENTITY_TYPE,
      Bytes.fromI32(TOKEN_ID).toHexString(),
      "difficulty",
      "0"
    );

    handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "0"
    );

    handleQuestFinished(createQuestFinishedEvent(USER_ADDRESS, 1));
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsCompleted",
      "1"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questsDistanceTravelled",
      "10"
    );
  });

  test("legacy questing xp does not increase after upgrade block", () => {
    // Perform a quest
    handleQuestStartedWithoutDifficulty(
      createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, 1)
    );
    handleQuestRevealed(createQuestRevealedEvent(USER_ADDRESS, 1));

    const legionMetadataId = `${LEGION_ADDRESS.toHexString()}-0x1-metadata`;
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "10"
    );

    // Set the new Questing XP gained block number
    const blockNumber = 12345678;
    setQuestingXpGainedBlockNumberIfEmpty(BigInt.fromI32(blockNumber));

    // Simulate new quest after block
    handleQuestStartedWithoutDifficulty(
      createQuestStartedWithoutDifficultyEvent(USER_ADDRESS, 1, 1)
    );
    handleQuestRevealed(
      createQuestRevealedEvent(USER_ADDRESS, 1, 0, 0, 0, 0, blockNumber)
    );

    // Legion should NOT have gained XP
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "10"
    );
  });

  test("new questing xp increases with event params", () => {
    // Give Legion XP
    handleQuestXpGained(createQuestXpGainedEvent(1, 1, 20));

    // Assert XP is saved
    const legionMetadataId = `${LEGION_ADDRESS.toHexString()}-0x1-metadata`;
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questing",
      "1"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "20"
    );

    // Give Legion XP
    handleQuestXpGained(createQuestXpGainedEvent(1, 2, 0));

    // Assert XP is saved
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questing",
      "2"
    );
    assert.fieldEquals(
      LEGION_INFO_ENTITY_TYPE,
      legionMetadataId,
      "questingXp",
      "0"
    );
  });

  test("questing works with difficulty parameter", () => {
    handleQuestStartedWithDifficulty(
      createQuestStartedEvent(USER_ADDRESS, TOKEN_ID, 1, Difficulty.Medium)
    );
    assert.fieldEquals(
      QUEST_ENTITY_TYPE,
      Bytes.fromI32(TOKEN_ID).toHexString(),
      "difficulty",
      "1"
    );
  });
});
