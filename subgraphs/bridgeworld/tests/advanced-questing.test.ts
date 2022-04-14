import { assert, test } from "matchstick-as/assembly";

import { BigInt } from "@graphprotocol/graph-ts";

import { ADVANCED_QUESTING_ADDRESS } from "@treasure/constants";

import { AdvancedQuest, AdvancedQuestReward } from "../generated/schema";
import { getAddressId } from "../src/helpers/utils";
import { getXpPerLevel } from "../src/helpers/xp";
import {
  handleAdvancedQuestContinued,
  handleAdvancedQuestEnded,
  handleAdvancedQuestStarted,
  handleTreasureTriadPlayed,
} from "../src/mappings/advanced-questing";
import { handleLegionQuestLevelUp } from "../src/mappings/legion";
import {
  RewardParam,
  advancedQuestingSetup,
  createAdvancedQuestContinuedEvent,
  createAdvancedQuestEndedEvent,
  createAdvancedQuestStartedEvent,
  createTreasureTriadPlayedEvent,
  mockEndTimeForLegion,
  simulateAdvancedQuest,
} from "./helpers/advanced-questing";
import { USER_ADDRESS } from "./helpers/constants";
import { createLegionQuestLevelUpEvent } from "./helpers/legion";

function getQuestId(legionId: i32): string {
  return getAddressId(ADVANCED_QUESTING_ADDRESS, BigInt.fromI32(legionId));
}

test("All fields are set as expected on quest start", () => {
  const legionId = 1;
  const legionStoreId = advancedQuestingSetup(legionId);
  const id = getQuestId(legionId);
  const requestId = 1;
  const zoneName = "B";
  const part: i8 = 0;
  const treasureIds = [2, 3];
  const treasureAmounts = [2, 1];
  const endTimestamp = new Date(0).getTime();
  const stasisHitCount = 2;

  mockEndTimeForLegion(legionId, endTimestamp, stasisHitCount);

  handleAdvancedQuestStarted(
    createAdvancedQuestStartedEvent(
      USER_ADDRESS,
      legionId,
      requestId,
      zoneName,
      part,
      treasureIds,
      treasureAmounts
    )
  );

  assert.fieldEquals(
    "AdvancedQuest",
    id,
    "requestId",
    BigInt.fromI32(requestId).toString()
  );
  assert.fieldEquals("AdvancedQuest", id, "status", "Idle");
  assert.fieldEquals("AdvancedQuest", id, "zoneName", zoneName);
  assert.fieldEquals("AdvancedQuest", id, "part", part.toString());
  assert.fieldEquals(
    "AdvancedQuest",
    id,
    "endTimestamp",
    endTimestamp.toString()
  );
  assert.fieldEquals(
    "AdvancedQuest",
    id,
    "stasisHitCount",
    stasisHitCount.toString()
  );
  assert.fieldEquals("AdvancedQuest", id, "token", legionStoreId);

  const treasureId1 = `${id}-${requestId}-0x2`;
  const treasureId2 = `${id}-${requestId}-0x3`;

  assert.fieldEquals(
    "AdvancedQuest",
    id,
    "treasures",
    `[${treasureId1}, ${treasureId2}]`
  );

  assert.fieldEquals("TokenQuantity", treasureId1, "token", "0x2");
  assert.fieldEquals("TokenQuantity", treasureId1, "quantity", "2");
  assert.fieldEquals("TokenQuantity", treasureId2, "token", "0x3");
  assert.fieldEquals("TokenQuantity", treasureId2, "quantity", "1");
});

test("Status transitions between Idle and Finished as expected", () => {
  const legionId = 1;
  advancedQuestingSetup(legionId);
  const questId = getQuestId(legionId);

  mockEndTimeForLegion(legionId, new Date(0).getTime(), 0);

  handleAdvancedQuestStarted(
    createAdvancedQuestStartedEvent(USER_ADDRESS, legionId, 1)
  );
  assert.fieldEquals("AdvancedQuest", questId, "status", "Idle");

  handleAdvancedQuestContinued(
    createAdvancedQuestContinuedEvent(USER_ADDRESS, legionId, 1, 1)
  );
  assert.fieldEquals("AdvancedQuest", questId, "status", "Idle");

  handleTreasureTriadPlayed(
    createTreasureTriadPlayedEvent(USER_ADDRESS, legionId)
  );
  assert.fieldEquals("AdvancedQuest", questId, "status", "Idle");

  handleAdvancedQuestEnded(
    createAdvancedQuestEndedEvent(USER_ADDRESS, legionId)
  );
  assert.fieldEquals("AdvancedQuest", `${questId}-1`, "status", "Finished");
});

test("Part increase as quest continues", () => {
  const legionId = 1;
  advancedQuestingSetup(legionId);
  const questId = getQuestId(legionId);

  mockEndTimeForLegion(legionId, new Date(0).getTime(), 0);

  handleAdvancedQuestStarted(
    createAdvancedQuestStartedEvent(USER_ADDRESS, legionId)
  );
  assert.fieldEquals("AdvancedQuest", questId, "part", "0");

  handleAdvancedQuestContinued(
    createAdvancedQuestContinuedEvent(USER_ADDRESS, legionId, 1, 1)
  );
  assert.fieldEquals("AdvancedQuest", questId, "part", "1");

  handleAdvancedQuestContinued(
    createAdvancedQuestContinuedEvent(USER_ADDRESS, legionId, 1, 2)
  );
  assert.fieldEquals("AdvancedQuest", questId, "part", "2");
});

test("XP increases based on level when quest ends", () => {
  const legionId = 1;
  const legionStoreId = advancedQuestingSetup(legionId);
  const mdId = `${legionStoreId}-metadata`;

  mockEndTimeForLegion(legionId, new Date(0).getTime(), 0);

  for (let level = 1; level < 6; level++) {
    assert.fieldEquals("LegionInfo", mdId, "questing", `${level}`);
    assert.fieldEquals("LegionInfo", mdId, "questingXp", "0");

    for (let questIndex = 1; questIndex <= 3; questIndex++) {
      simulateAdvancedQuest(USER_ADDRESS, legionId);
      const xp = getXpPerLevel(level) * questIndex;
      assert.fieldEquals("LegionInfo", mdId, "questingXp", `${xp}`);
    }

    handleLegionQuestLevelUp(
      createLegionQuestLevelUpEvent(legionId, level + 1)
    );
  }

  assert.fieldEquals("LegionInfo", mdId, "questing", "6");
});

test("XP doesn't increase at level 6", () => {
  const legionId = 1;
  const legionStoreId = advancedQuestingSetup(legionId);
  const mdId = `${legionStoreId}-metadata`;

  mockEndTimeForLegion(legionId, new Date(0).getTime(), 0);

  handleLegionQuestLevelUp(createLegionQuestLevelUpEvent(legionId, 6));
  assert.fieldEquals("LegionInfo", mdId, "questing", "6");

  simulateAdvancedQuest(USER_ADDRESS, legionId);
  assert.fieldEquals("LegionInfo", mdId, "questingXp", "0");

  simulateAdvancedQuest(USER_ADDRESS, legionId);
  assert.fieldEquals("LegionInfo", mdId, "questingXp", "0");
});

test("Quest and Triad ids are changed when quest is ended", () => {
  const legionId = 1;
  advancedQuestingSetup(legionId);
  const id = getQuestId(legionId);

  simulateAdvancedQuest(USER_ADDRESS, legionId, 1, 2, false, true);

  assert.fieldEquals("AdvancedQuest", id, "requestId", "1");
  assert.fieldEquals("TreasureTriadResult", id, "advancedQuest", id);

  handleAdvancedQuestEnded(
    createAdvancedQuestEndedEvent(USER_ADDRESS, legionId)
  );

  assert.notInStore("AdvancedQuest", id);
  assert.notInStore("TreasureTriadResult", id);

  assert.fieldEquals(
    "AdvancedQuest",
    `${id}-1`,
    "treasureTriadResult",
    `${id}-1`
  );
  assert.fieldEquals(
    "TreasureTriadResult",
    `${id}-1`,
    "advancedQuest",
    `${id}-1`
  );
});

test("Quest rewards are set when ended", () => {
  const legionId = 1;
  const id = getQuestId(legionId);
  advancedQuestingSetup(legionId);

  simulateAdvancedQuest(USER_ADDRESS, legionId, 1, 2, false, false);

  let quest: AdvancedQuest = AdvancedQuest.load(id) as AdvancedQuest;

  handleAdvancedQuestEnded(
    createAdvancedQuestEndedEvent(USER_ADDRESS, legionId, [
      new RewardParam(1, 2, 3, 4),
      new RewardParam(5, 6, 7, 8),
    ])
  );

  quest = AdvancedQuest.load(`${id}-${quest.requestId}`) as AdvancedQuest;

  assert.fieldEquals(
    "AdvancedQuestReward",
    `${quest.id}-0`,
    "advancedQuest",
    quest.id
  );
  assert.fieldEquals(
    "AdvancedQuestReward",
    `${quest.id}-0`,
    "treasureFragment",
    "0x3"
  );
  assert.fieldEquals("AdvancedQuestReward", `${quest.id}-0`, "treasure", "0x4");
  assert.fieldEquals("TokenQuantity", `${quest.id}-0-0x1`, "token", "0x1");
  assert.fieldEquals("TokenQuantity", `${quest.id}-0-0x1`, "quantity", "2");

  assert.fieldEquals(
    "AdvancedQuestReward",
    `${quest.id}-1`,
    "advancedQuest",
    quest.id
  );
  assert.fieldEquals(
    "AdvancedQuestReward",
    `${quest.id}-1`,
    "treasureFragment",
    "0x7"
  );
  assert.fieldEquals("AdvancedQuestReward", `${quest.id}-1`, "treasure", "0x8");
  assert.fieldEquals("TokenQuantity", `${quest.id}-1-0x5`, "token", "0x5");
  assert.fieldEquals("TokenQuantity", `${quest.id}-1-0x5`, "quantity", "6");
});
