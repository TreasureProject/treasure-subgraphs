import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts";

import { QuestStarted as LegacyQuestStarted } from "../../generated/Questing Legacy/Questing";
import {
  QuestFinished,
  QuestRevealed,
  QuestStarted,
} from "../../generated/Questing/Questing";
import { _Quest } from "../../generated/schema";
import { QUEST_DIFFICULTIES } from "../helpers/constants";
import { getQuestId } from "../helpers/ids";
import {
  getLegion,
  getOrCreateLegionStat,
  getOrCreateQuestingDifficultyStat,
  getOrCreateTreasureStat,
  getOrCreateUserStat,
  getTimeIntervalQuestingStats,
} from "../helpers/models";

function handleQuestStarted(
  block: ethereum.Block,
  userAddress: Address,
  tokenId: BigInt,
  difficultyIndex: i32
): void {
  const quest = new _Quest(getQuestId(tokenId));
  const difficulty = QUEST_DIFFICULTIES[difficultyIndex];
  quest.difficulty = difficulty;
  quest.save();

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[questing] Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalQuestingStats(block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.questsStarted += 1;

    const userStat = getOrCreateUserStat(
      stat.id,
      userAddress,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );

    if (userStat.questsStarted == 0) {
      stat.allAddressesCount += 1;
    }

    if (userStat.questsStarted == userStat.questsFinished) {
      stat.activeAddressesCount += 1;
    }

    userStat.questsStarted += 1;
    userStat.save();

    const difficultyStat = getOrCreateQuestingDifficultyStat(
      stat.id,
      difficulty,
      stat.startTimestamp,
      stat.endTimestamp
    );
    difficultyStat.questsStarted += 1;
    difficultyStat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      legionStat.questingStat = stat.id;
      legionStat.questsStarted += 1;
      legionStat.save();
    }

    stat.save();
  }
}

export function handleQuestStartedWithDifficulty(event: QuestStarted): void {
  const params = event.params;
  handleQuestStarted(
    event.block,
    params._owner,
    params._tokenId,
    params._difficulty
  );
}

export function handleQuestStartedWithoutDifficulty(
  event: LegacyQuestStarted
): void {
  const params = event.params;
  handleQuestStarted(
    event.block,
    params._owner,
    params._tokenId,
    0 // Easy
  );
}

export function handleQuestRevealed(event: QuestRevealed): void {
  const params = event.params;
  const tokenId = params._tokenId;
  const result = params._reward;
  const shardsEarned = result.crystalShardAmount;
  const starlightEarned = result.starlightAmount;
  const universalLocksEarned = result.universalLockAmount;
  const treasuresEarned = result.treasureId.gt(BigInt.zero()) ? 1 : 0;

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[questing] Legion not found: {}", [tokenId.toString()]);
  }

  const quest = _Quest.load(getQuestId(tokenId));
  if (!quest) {
    log.error("[questing] Quest not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalQuestingStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.questingShardsEarned += shardsEarned;
    stat.questingStarlightEarned += starlightEarned;
    stat.questingUniversalLocksEarned += universalLocksEarned;
    stat.questingTreasuresEarned += treasuresEarned;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._owner,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.questingShardsEarned += shardsEarned;
    userStat.questingStarlightEarned += starlightEarned;
    userStat.questingUniversalLocksEarned += universalLocksEarned;
    userStat.questingTreasuresEarned += treasuresEarned;
    userStat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      legionStat.questingStat = stat.id;
      legionStat.questingShardsEarned += shardsEarned;
      legionStat.questingStarlightEarned += starlightEarned;
      legionStat.questingUniversalLocksEarned += universalLocksEarned;
      legionStat.questingTreasuresEarned += treasuresEarned;
      legionStat.save();
    }

    if (quest) {
      const difficultyStat = getOrCreateQuestingDifficultyStat(
        stat.id,
        quest.difficulty,
        stat.startTimestamp,
        stat.endTimestamp
      );
      difficultyStat.questingShardsEarned += shardsEarned;
      difficultyStat.questingStarlightEarned += starlightEarned;
      difficultyStat.questingUniversalLocksEarned += universalLocksEarned;
      difficultyStat.questingTreasuresEarned += treasuresEarned;
      difficultyStat.save();
    }

    if (treasuresEarned > 0) {
      const treasureStat = getOrCreateTreasureStat(
        stat.id,
        result.treasureId,
        stat.startTimestamp,
        stat.endTimestamp
      );
      treasureStat.questingStat = stat.id;
      treasureStat.questingEarned += treasuresEarned;
      treasureStat.save();
    }

    stat.save();
  }
}

export function handleQuestFinished(event: QuestFinished): void {
  const params = event.params;
  const tokenId = params._tokenId;

  const quest = _Quest.load(getQuestId(tokenId));
  if (!quest) {
    log.error("[questing] Quest not found: {}", [tokenId.toString()]);
  }

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("[questing] Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalQuestingStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.questsFinished += 1;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._owner,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.questsFinished += 1;
    userStat.save();

    if (userStat.questsStarted == userStat.questsFinished) {
      stat.activeAddressesCount = Math.max(
        stat.activeAddressesCount - 1,
        0
      ) as i32;
    }

    if (quest) {
      const difficultyStat = getOrCreateQuestingDifficultyStat(
        stat.id,
        quest.difficulty,
        stat.startTimestamp,
        stat.endTimestamp
      );
      difficultyStat.questsFinished += 1;
      difficultyStat.save();
    }

    if (legion) {
      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      legionStat.questingStat = stat.id;
      legionStat.questsFinished += 1;
      legionStat.save();
    }

    stat.save();
  }

  if (quest) {
    store.remove("_Quest", quest.id);
  }
}
