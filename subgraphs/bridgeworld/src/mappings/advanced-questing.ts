import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
  TREASURE_FRAGMENT_ADDRESS,
} from "@treasure/constants";

import {
  AdvancedQuestContinued,
  AdvancedQuestEnded,
  AdvancedQuestStarted,
  QPForEndingPart,
  TreasureTriadPlayed,
} from "../../generated/Advanced Questing/AdvancedQuesting";
import {
  AdvancedQuest,
  AdvancedQuestReward,
  LegionInfo,
  TokenQuantity,
  TreasureTriadResult,
} from "../../generated/schema";
import {
  isQuestingXpGainedEnabled,
  setQuestingXpGainedBlockNumberIfEmpty,
} from "../helpers/config";
import {
  QUEST_DISTANCE_TRAVELLED_PER_PART,
  ZERO_BI,
} from "../helpers/constants";
import { getOrCreateUser } from "../helpers/user";
import { getAddressId } from "../helpers/utils";
import { getXpPerLevel } from "../helpers/xp";

export function handleAdvancedQuestStarted(event: AdvancedQuestStarted): void {
  const params = event.params;
  const legionTokenId = params._startQuestParams.legionId;

  const quest = new AdvancedQuest(Bytes.fromI32(legionTokenId.toI32()));
  quest.requestId = params._requestId;
  quest.token = getAddressId(LEGION_ADDRESS, legionTokenId);
  quest.user = params._owner;
  quest.status = "Idle";
  quest.zoneName = params._startQuestParams.zoneName;
  quest.part = params._startQuestParams.advanceToPart;
  quest.endTimestamp = ZERO_BI;
  quest.stasisHitCount = 0;
  quest.hadStasisPart2 = false;
  quest.hadStasisPart3 = false;

  const treasures: Bytes[] = [];
  for (let i = 0; i < params._startQuestParams.treasureIds.length; i++) {
    const tokenId = getAddressId(
      TREASURE_ADDRESS,
      params._startQuestParams.treasureIds[i]
    );

    const treasure = new TokenQuantity(
      quest.id.concatI32(quest.requestId.toI32()).concat(tokenId)
    );
    treasure.token = tokenId;
    treasure.quantity = params._startQuestParams.treasureAmounts[i].toI32();
    treasure.save();

    treasures.push(treasure.id);
  }

  quest.treasures = treasures;
  quest.save();
}

export function handleAdvancedQuestContinued(
  event: AdvancedQuestContinued
): void {
  const params = event.params;
  const quest = AdvancedQuest.load(Bytes.fromI32(params._legionId.toI32()));
  if (!quest) {
    log.error("[advanced-quest-started] Unknown quest: {}", [
      params._legionId.toString(),
    ]);
    return;
  }

  quest.requestId = params._requestId;
  quest.endTimestamp = ZERO_BI;
  quest.stasisHitCount = 0;
  quest.part = params._toPart;
  quest.save();
}

export function handleTreasureTriadPlayed(event: TreasureTriadPlayed): void {
  const params = event.params;
  const id = Bytes.fromI32(params._legionId.toI32());
  const quest = AdvancedQuest.load(id);
  if (!quest) {
    log.error("[handleTreasureTriadPlayed] Unknown quest: {}", [
      params._legionId.toString(),
    ]);
    return;
  }

  const result = new TreasureTriadResult(id);
  result.advancedQuest = quest.id;
  result.playerWon = params._playerWon;
  result.numberOfCardsFlipped = params._numberOfCardsFlipped;
  result.numberOfCorruptedCardsRemaining =
    params._numberOfCorruptedCardsRemaining;
  result.save();

  quest.treasureTriadResult = result.id;
  quest.save();
}

export function handleAdvancedQuestEnded(event: AdvancedQuestEnded): void {
  const params = event.params;
  const id = Bytes.fromI32(params._legionId.toI32());
  const quest = AdvancedQuest.load(id);
  if (!quest) {
    log.error("[advanced-quest-ended] Unknown quest: {}", [
      params._legionId.toString(),
    ]);
    return;
  }

  quest.id = quest.id.concatI32(quest.requestId.toI32());
  quest.status = "Finished";
  quest.endTimestamp = event.block.timestamp.times(BigInt.fromI32(1000));

  const user = getOrCreateUser(quest.user);
  user.finishedAdvancedQuestCount += 1;
  user.save();

  store.remove("AdvancedQuest", id.toHexString());

  const rewards = params._rewards.filter(
    (reward) =>
      reward.consumableId.toI32() !== 0 ||
      reward.treasureFragmentId.toI32() !== 0 ||
      reward.treasureId.toI32() !== 0
  );
  for (let i = 0; i < rewards.length; i++) {
    const rewardId = quest.id.concatI32(i);
    const reward = new AdvancedQuestReward(rewardId);
    reward.advancedQuest = quest.id;

    if (rewards[i].consumableId.toI32() !== 0) {
      const consumable = new TokenQuantity(rewardId);
      consumable.token = getAddressId(
        CONSUMABLE_ADDRESS,
        rewards[i].consumableId
      );
      consumable.quantity = rewards[i].consumableAmount.toI32();
      consumable.save();

      reward.consumable = consumable.id;
    }

    if (rewards[i].treasureFragmentId.toI32() != 0) {
      reward.treasureFragment = getAddressId(
        TREASURE_FRAGMENT_ADDRESS,
        rewards[i].treasureFragmentId
      );
    }

    if (rewards[i].treasureId.toI32() != 0) {
      reward.treasure = getAddressId(TREASURE_ADDRESS, rewards[i].treasureId);
    }

    reward.save();
  }

  const treasureTriadResult = TreasureTriadResult.load(id);
  if (treasureTriadResult) {
    treasureTriadResult.id = quest.id;
    treasureTriadResult.advancedQuest = quest.id;
    treasureTriadResult.save();

    quest.treasureTriadResult = treasureTriadResult.id;

    store.remove("TreasureTriadResult", id.toHexString());
  }

  quest.save();

  const metadata = LegionInfo.load(quest.token.toHexString());
  if (!metadata) {
    log.error("[advanced-quest-end] Legion metadata not found: {}", [
      quest.token.toHexString(),
    ]);
    return;
  }

  // Prefer the QPGained event if it's available at this block
  if (
    !isQuestingXpGainedEnabled(event.block.number) &&
    metadata.type != "Recruit" &&
    metadata.questing != 6
  ) {
    metadata.questingXp += getXpPerLevel(metadata.questing);
  }

  metadata.questsCompleted += 1;
  metadata.questsDistanceTravelled +=
    QUEST_DISTANCE_TRAVELLED_PER_PART * quest.part;
  metadata.save();
}

/*
  Not required for logging new XP, but we need it to know the block number
  when the new Questing XP flow was deployed.
 */
export function handleAdvancedQuestXpGained(event: QPForEndingPart): void {
  setQuestingXpGainedBlockNumberIfEmpty(event.block.number);
}
