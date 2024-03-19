import { BigInt, log, store } from "@graphprotocol/graph-ts";

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
import { QUEST_DISTANCE_TRAVELLED_PER_PART } from "../helpers";
import {
  isQuestingXpGainedEnabled,
  setQuestingXpGainedBlockNumberIfEmpty,
} from "../helpers/config";
import { getUser } from "../helpers/user";
import { getAddressId } from "../helpers/utils";
import { getXpPerLevel } from "../helpers/xp";

export function handleAdvancedQuestStarted(event: AdvancedQuestStarted): void {
  const params = event.params;

  const quest = new AdvancedQuest(
    getAddressId(event.address, params._startQuestParams.legionId)
  );

  quest.requestId = params._requestId;
  quest.token = getAddressId(LEGION_ADDRESS, params._startQuestParams.legionId);
  quest.user = params._owner.toHexString();
  quest.status = "Idle";
  quest.zoneName = params._startQuestParams.zoneName;
  quest.part = params._startQuestParams.advanceToPart;
  quest.endTimestamp = BigInt.zero();
  quest.stasisHitCount = 0;
  quest.hadStasisPart2 = false;
  quest.hadStasisPart3 = false;

  const treasures: string[] = [];

  for (let i = 0; i < params._startQuestParams.treasureIds.length; i++) {
    const tokenId = getAddressId(
      TREASURE_ADDRESS,
      params._startQuestParams.treasureIds[i]
    );

    const treasure = new TokenQuantity(
      `${quest.id}-${quest.requestId.toHex()}-${tokenId}`
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
  const id = getAddressId(event.address, params._legionId);

  const quest = AdvancedQuest.load(id);

  if (!quest) {
    log.error("[advanced-quest-started] Unknown quest: {}", [id]);

    return;
  }

  quest.requestId = params._requestId;
  quest.endTimestamp = BigInt.fromI32(0);
  quest.stasisHitCount = 0;
  quest.part = params._toPart;

  quest.save();
}

export function handleTreasureTriadPlayed(event: TreasureTriadPlayed): void {
  const params = event.params;

  const id = getAddressId(event.address, params._legionId);
  const result = new TreasureTriadResult(id);
  const quest = AdvancedQuest.load(id);

  if (!quest) {
    log.error("[advanced-quest-treasure-triad-played] Unknown quest: {}", [id]);

    return;
  }

  result.advancedQuest = quest.id;
  result.playerWon = params._playerWon;
  result.numberOfCardsFlipped = params._numberOfCardsFlipped;
  result.numberOfCorruptedCardsRemaining =
    params._numberOfCorruptedCardsRemaining;

  quest.treasureTriadResult = result.id;

  result.save();
  quest.save();
}

export function handleAdvancedQuestEnded(event: AdvancedQuestEnded): void {
  const params = event.params;

  const id = getAddressId(event.address, params._legionId);
  const quest = AdvancedQuest.load(id);
  const treasureTriadResult = TreasureTriadResult.load(id);

  if (!quest) {
    log.error("[advanced-quest-ended] Unknown quest: {}", [id]);

    return;
  }

  quest.id = `${quest.id}-${quest.requestId.toHex()}`;
  quest.status = "Finished";
  quest.endTimestamp = event.block.timestamp.times(BigInt.fromI32(1000));

  const user = getUser(quest.user);
  user.finishedAdvancedQuestCount += 1;
  user.save();

  store.remove("AdvancedQuest", id);

  const rewards = params._rewards.filter(
    (reward) =>
      reward.consumableId.toI32() !== 0 ||
      reward.treasureFragmentId.toI32() !== 0 ||
      reward.treasureId.toI32() !== 0
  );
  for (let i = 0; i < rewards.length; i++) {
    const rewardId = `${quest.id}-${BigInt.fromI32(i).toHex()}`;
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

  if (treasureTriadResult) {
    treasureTriadResult.id = `${id}-${quest.requestId.toHex()}`;
    treasureTriadResult.advancedQuest = quest.id;
    treasureTriadResult.save();

    quest.treasureTriadResult = treasureTriadResult.id;

    store.remove("TreasureTriadResult", id);
  }

  quest.save();

  const metadata = LegionInfo.load(`${quest.token}-metadata`);
  if (!metadata) {
    log.error("[advanced-quest-end] Legion metadata not found: {}", [
      quest.token,
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
