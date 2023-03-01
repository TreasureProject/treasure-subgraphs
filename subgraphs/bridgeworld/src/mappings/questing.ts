import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { QuestStarted as LegacyQuestStarted } from "../../generated/Questing Legacy/Questing";
import {
  QPGained,
  QuestFinished,
  QuestRevealed,
  QuestStarted,
} from "../../generated/Questing/Questing";
import { LegionInfo, Quest } from "../../generated/schema";
import {
  QUEST_DISTANCE_TRAVELLED_PER_PART,
  getAddressId,
  getXpPerLevel,
} from "../helpers";
import { isQuestingXpGainedEnabled } from "../helpers/config";
import { getLegionMetadata } from "../helpers/legion";
import { bigIntToBytes } from "../helpers/number";

function handleQuestStarted(
  user: Address,
  tokenId: BigInt,
  difficulty: i32
): void {
  const quest = new Quest(bigIntToBytes(tokenId));
  quest.user = user.toHexString();
  quest.token = getAddressId(LEGION_ADDRESS, tokenId);
  quest.difficulty = difficulty;
  quest.status = "Revealable";
  quest.save();
}

export function handleQuestStartedWithDifficulty(event: QuestStarted): void {
  const params = event.params;
  handleQuestStarted(params._owner, params._tokenId, params._difficulty);
}

export function handleQuestStartedWithoutDifficulty(
  event: LegacyQuestStarted
): void {
  const params = event.params;
  handleQuestStarted(
    params._owner,
    params._tokenId,
    0 // Easy difficulty
  );
}

export function handleQuestRevealed(event: QuestRevealed): void {
  const params = event.params;
  const quest = Quest.load(bigIntToBytes(params._tokenId));
  if (!quest) {
    log.error("[questing] Revealing unknown quest: {}", [
      params._tokenId.toString(),
    ]);
    return;
  }

  quest.status = "Revealed";
  quest.save();

  // Prefer the QPGained event if it's available at this block
  if (!isQuestingXpGainedEnabled(event.block.number)) {
    const metadata = LegionInfo.load(`${quest.token}-metadata`);
    if (metadata && metadata.type != "Recruit" && metadata.questing != 6) {
      metadata.questingXp += getXpPerLevel(metadata.questing);
      metadata.save();
    }
  }
}

export function handleQuestFinished(event: QuestFinished): void {
  const params = event.params;
  const quest = Quest.load(bigIntToBytes(params._tokenId));
  if (!quest) {
    log.error("[questing] Finishing unknown quest: {}", [
      params._tokenId.toString(),
    ]);
    return;
  }

  const metadata = LegionInfo.load(`${quest.token}-metadata`);
  if (metadata) {
    metadata.questsCompleted += 1;
    metadata.questsDistanceTravelled +=
      (quest.difficulty + 1) * QUEST_DISTANCE_TRAVELLED_PER_PART;
    metadata.save();
  } else {
    log.warning("[questing] Legion metadata not found: {}", [quest.token]);
  }

  store.remove("Quest", quest.id.toHexString());
}

export function handleQuestXpGained(event: QPGained): void {
  const params = event.params;
  const metadata = getLegionMetadata(params._tokenId);
  metadata.questing = params._questLevel;
  metadata.questingXp = params._qpFinal.toI32();
  metadata.save();
}
