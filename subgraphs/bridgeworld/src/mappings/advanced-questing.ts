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
  TreasureTriadResult,
} from "../../generated/schema";
import { getAddressId } from "../helpers/utils";
import { getXpPerLevel } from "../helpers/xp";

export function handleAdvancedQuestStarted(event: AdvancedQuestStarted): void {
  const params = event.params;

  const random = Random.load(params._requestId.toHexString());
  const quest = new AdvancedQuest(
    getAddressId(event.address, params._startQuestParams.legionId)
  );

  if (!random) {
    log.error("[advanced-quest-started] Unknown random: {}", [
      params._requestId.toString(),
    ]);

    return;
  }

  quest.random = random.id;
  quest.token = getAddressId(LEGION_ADDRESS, params._startQuestParams.legionId);
  quest.user = params._owner.toHexString();
  quest.status = "Idle";
  quest.zoneName = params._startQuestParams.zoneName;
  quest.part = params._startQuestParams.advanceToPart;
  quest.treasures = params._startQuestParams.treasureIds.map<string>((value) =>
    value.toHex()
  );
  quest.treasureAmounts = params._startQuestParams.treasureAmounts.map<i32>(
    (value) => value.toI32()
  );

  updateQuestEndTimeAndStasis(quest, params._startQuestParams.legionId);

  random.requestId = params._requestId;
  random.advancedQuest = quest.id;

  quest.save();
  random.save();
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

  const questId = getAddressId(event.address, params._legionId);
  const id = getAddressId(event.address, params._legionId);
  const result = new TreasureTriadResult(id);
  const quest = AdvancedQuest.load(questId);

  if (!quest) {
    log.error("[advanced-quest-treasure-triad-played] Unknown quest: {}", [
      questId,
    ]);

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
  const treasureTriadResultId = getAddressId(event.address, params._legionId);
  const treasureTriadResult = TreasureTriadResult.load(treasureTriadResultId);

  if (!quest) {
    log.error("[advanced-quest-ended] Unknown quest: {}", [id]);

    return;
  }

  quest.id = `${quest.id}-${quest.random}`;
  quest.status = "Finished";

  store.remove("AdvancedQuest", id);

  const rewards: string[] = [];

  for (let i = 0; i < params._rewards.length; i++) {
    const rewardId = `${quest.id}-${i}`;
    const reward = new AdvancedQuestReward(rewardId);

    reward.consumableId = params._rewards[i].consumableId;
    reward.consumableAmount = params._rewards[i].consumableAmount;
    reward.treasureFragmentId = params._rewards[i].treasureFragmentId;
    reward.treasureId = params._rewards[i].treasureId;
    reward.advancedQuest = quest.id;

    rewards.push(reward.id);

    reward.save();
  }

  quest.rewards = rewards;

  if (treasureTriadResult) {
    treasureTriadResult.id = `${treasureTriadResultId}-${quest.random}`;
    treasureTriadResult.advancedQuest = quest.id;
    treasureTriadResult.save();

    quest.treasureTriadResult = treasureTriadResult.id;

    store.remove("TreasureTriadResult", treasureTriadResultId);
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
