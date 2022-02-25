import { Address, BigInt, log } from "@graphprotocol/graph-ts";

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
  getOrCreateUser,
  getTimeIntervalQuestingStats,
} from "../helpers/models";

function handleQuestStarted(
  timestamp: BigInt,
  userAddress: Address,
  tokenId: BigInt,
  difficultyIndex: i32
): void {
  const user = getOrCreateUser(userAddress);
  user.questsStarted += 1;
  user.save();

  const quest = new _Quest(getQuestId(tokenId));
  const difficulty = QUEST_DIFFICULTIES[difficultyIndex];
  quest.difficulty = difficulty;
  quest.save();

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalQuestingStats(timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.questsStarted += 1;
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }

    if (!stat._allAddresses.includes(user.id)) {
      stat._allAddresses = stat._allAddresses.concat([user.id]);
      stat.allAddressesCount = stat._allAddresses.length;
    }

    const difficultyStat = getOrCreateQuestingDifficultyStat(
      stat.id,
      difficulty
    );
    difficultyStat.startTimestamp = stat.startTimestamp;
    difficultyStat.endTimestamp = stat.endTimestamp;
    difficultyStat.questsStarted += 1;
    difficultyStat.save();

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
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
    event.block.timestamp,
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
    event.block.timestamp,
    params._owner,
    params._tokenId,
    0 // Easy
  );
}

export function handleQuestRevealed(event: QuestRevealed): void {}

export function handleQuestFinished(event: QuestFinished): void {
  const params = event.params;
  const tokenId = params._tokenId;

  const user = getOrCreateUser(params._owner);
  user.questsFinished += 1;
  user.save();
  const isUserQuesting = user.questsStarted > user.questsFinished;

  const quest = _Quest.load(getQuestId(tokenId));
  if (!quest) {
    log.error("Quest not found: {}", [tokenId.toString()]);
  }

  const legion = getLegion(tokenId);
  if (!legion) {
    log.error("Legion not found: {}", [tokenId.toString()]);
  }

  const stats = getTimeIntervalQuestingStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.questsFinished += 1;
    if (!isUserQuesting) {
      const addressIndex = stat._activeAddresses.indexOf(user.id);
      if (addressIndex >= 0) {
        const addresses = stat._activeAddresses;
        addresses.splice(addressIndex, 1);
        stat._activeAddresses = addresses;
        stat.activeAddressesCount = addresses.length;
      }
    }
    stat.save();

    if (quest) {
      const difficultyStat = getOrCreateQuestingDifficultyStat(
        stat.id,
        quest.difficulty
      );
      difficultyStat.questsFinished += 1;
      difficultyStat.save();
    }

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.questsFinished += 1;
      legionStat.save();
    }
  }
}
