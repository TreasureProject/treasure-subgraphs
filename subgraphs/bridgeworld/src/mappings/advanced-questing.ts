import { BigInt, log, store } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  CONSUMABLE_ADDRESS,
  LEGION_ADDRESS,
  TREASURE_ADDRESS,
  TREASURE_FRAGMENT_ADDRESS,
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

  const random = Random.load(params._requestId.toHexString());
  if (!random) {
    log.error("[advanced-quest-started]: Unknown random: {}", [
      params._requestId.toString(),
    ]);

    return;
  }

  const quest = new AdvancedQuest(
    getAddressId(event.address, params._startQuestParams.legionId)
  );

  quest.requestId = params._requestId;
  quest.random = random.id;
  quest.token = getAddressId(LEGION_ADDRESS, params._startQuestParams.legionId);
  quest.user = params._owner.toHexString();
  quest.status = "Idle";
  quest.zoneName = params._startQuestParams.zoneName;
  quest.part = params._startQuestParams.advanceToPart;

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

  random.advancedQuest = quest.id;
  random.save();

  // updateQuestEndTimeAndStasis(quest, params._startQuestParams.legionId);
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
  // updateQuestEndTimeAndStasis(quest, params._legionId);

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

  store.remove("AdvancedQuest", id);

  for (let i = 0; i < params._rewards.length; i++) {
    const rewardId = `${quest.id}-${BigInt.fromI32(i).toHex()}`;
    const reward = new AdvancedQuestReward(rewardId);

    reward.advancedQuest = quest.id;

    if (params._rewards[i].consumableId.toI32() !== 0) {
      const consumable = new TokenQuantity(rewardId);

      consumable.token = getAddressId(
        CONSUMABLE_ADDRESS,
        params._rewards[i].consumableId
      );
      consumable.quantity = params._rewards[i].consumableAmount.toI32();

      consumable.save();

      reward.consumable = consumable.id;
    }

    if (params._rewards[i].treasureFragmentId.toI32() != 0) {
      reward.treasureFragment = getAddressId(
        TREASURE_FRAGMENT_ADDRESS,
        params._rewards[i].treasureFragmentId
      );
    }

    if (params._rewards[i].treasureId.toI32() != 0) {
      reward.treasure = getAddressId(
        TREASURE_ADDRESS,
        params._rewards[i].treasureId
      );
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

export function updateQuestEndTimeAndStasis(
  quest: AdvancedQuest,
  legionId: BigInt
): void {
  const advancedQuesting = AdvancedQuesting.bind(ADVANCED_QUESTING_ADDRESS);
  const endTimeResult = advancedQuesting.try_endTimeForLegion(legionId);

  if (!endTimeResult.reverted) {
    quest.endTimestamp = endTimeResult.value.value0.times(BigInt.fromI32(1000));
    quest.stasisHitCount = endTimeResult.value.value1;
  } else {
    log.error("[advanced-quest] Failed to get endTime for legion: {}", [
      legionId.toString(),
    ]);
  }
}
