import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
} from "@treasure/constants";

import {
  AdvancedQuestContinued,
  AdvancedQuestEnded,
  AdvancedQuestStarted,
  AdvancedQuesting,
  TreasureTriadPlayed,
} from "../../generated/Advanced Questing/AdvancedQuesting";
import {
  AdvancedQuest,
  AdvancedQuestReward,
  LegionInfo,
  Random,
  TokenQuantity,
  TreasureTriadResult,
} from "../../generated/schema";
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

  const treasures: string[] = [];

  for (let i = 0; i < params._startQuestParams.treasureIds.length; i++) {
    const tokenId = params._startQuestParams.treasureIds[i].toHex();

    const treasure = new TokenQuantity(
      `${quest.id}-${quest.requestId}-${tokenId}`
    );
    treasure.token = tokenId;
    treasure.quantity = params._startQuestParams.treasureAmounts[i].toI32();

    treasure.save();

    treasures.push(treasure.id);
  }

  quest.treasures = treasures;

  updateQuestEndTimeAndStasis(quest, params._startQuestParams.legionId);

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

  quest.part = params._toPart;
  updateQuestEndTimeAndStasis(quest, params._legionId);

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

  quest.id = `${quest.id}-${quest.requestId}`;
  quest.status = "Finished";

  store.remove("AdvancedQuest", id);

  for (let i = 0; i < params._rewards.length; i++) {
    const rewardId = `${quest.id}-${i}`;
    const reward = new AdvancedQuestReward(rewardId);

    reward.advancedQuest = quest.id;

    if (params._rewards[i].consumableId.toI32() !== 0) {
      const consumable = new TokenQuantity(
        `${rewardId}-${params._rewards[i].consumableId.toHex()}`
      );
      consumable.token = params._rewards[i].consumableId.toHex();
      consumable.quantity = params._rewards[i].consumableAmount.toI32();

      consumable.save();

      reward.consumable = consumable.id;
    }

    if (params._rewards[i].treasureFragmentId.toI32() != 0) {
      reward.treasureFragment = params._rewards[i].treasureFragmentId.toHex();
    }

    if (params._rewards[i].treasureId.toI32() != 0) {
      reward.treasure = params._rewards[i].treasureId.toHex();
    }

    reward.save();
  }

  if (treasureTriadResult) {
    treasureTriadResult.id = `${id}-${quest.requestId}`;
    treasureTriadResult.advancedQuest = quest.id;
    treasureTriadResult.save();

    quest.treasureTriadResult = treasureTriadResult.id;

    store.remove("TreasureTriadResult", id);
  }

  quest.save();

  const metadata = LegionInfo.load(`${quest.token}-metadata`);

  if (metadata) {
    if (metadata.type != "Recruit" && metadata.questing != 6) {
      metadata.questingXp += getXpPerLevel(metadata.questing);
      metadata.save();
    }
  } else {
    log.warning(
      "[advanced-quest-end] Failed to update XP, metadata not found: {}",
      [quest.token]
    );
  }
}

function updateQuestEndTimeAndStasis(
  quest: AdvancedQuest,
  legionId: BigInt
): void {
  const advancedQuesting = AdvancedQuesting.bind(ADVANCED_QUESTING_ADDRESS);
  const endTimeResult = advancedQuesting.try_endTimeForLegion(legionId);

  if (!endTimeResult.reverted) {
    quest.endTimestamp = endTimeResult.value.value0.times(BigInt.fromI32(1000));
    quest.stasisHitCount = endTimeResult.value.value1;
  }
}
