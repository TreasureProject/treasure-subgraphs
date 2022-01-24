import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { Quest, Random, Reward } from "../../generated/schema";
import {
  QuestFinished,
  QuestRevealed,
  QuestStarted,
} from "../../generated/Questing/Questing";
import { LEGION_ADDRESS, TREASURE_ADDRESS } from "@treasure/constants";
import { getAddressId } from "../helpers/utils";

export function handleQuestStarted(event: QuestStarted): void {
  let params = event.params;
  let tokenId = params._tokenId;
  let requestId = params._requestId;
  let finishTime = params._finishTime;
  let user = params._owner;

  let random = Random.load(requestId.toHexString());
  let quest = new Quest(getAddressId(event.address, tokenId));

  if (!random) {
    log.error("[quest-started] Unknown random: {}", [requestId.toString()]);

    return;
  }

  quest.endTimestamp = finishTime.times(BigInt.fromI32(1000));
  quest.token = getAddressId(LEGION_ADDRESS, tokenId);
  quest.random = random.id;
  quest.status = "Idle";
  quest.user = user.toHexString();

  random.quest = quest.id;
  random.requestId = requestId;

  quest.save();
  random.save();
}

export function handleQuestRevealed(event: QuestRevealed): void {
  let params = event.params;
  let result = params._reward;
  let tokenId = params._tokenId;
  let id = getAddressId(event.address, tokenId);

  let quest = Quest.load(id);

  if (!quest) {
    log.error("Unknown craft: {}", [id]);

    return;
  }

  let reward = new Reward(`${id}-${quest.random}`);

  reward.crystalShards = result.crystalShardAmount;
  reward.starlights = result.starlightAmount;

  if (result.treasureId.gt(BigInt.zero())) {
    reward.treasure = getAddressId(TREASURE_ADDRESS, result.treasureId);
  }

  reward.universalLocks = result.universalLockAmount;

  reward.save();

  quest.reward = reward.id;
  quest.status = "Revealed";

  quest.save();
}

export function handleQuestFinished(event: QuestFinished): void {
  let id = getAddressId(event.address, event.params._tokenId);

  let quest = Quest.load(id);

  if (!quest) {
    log.error("Unknown quest: {}", [id]);

    return;
  }

  quest.id = `${quest.id}-${quest.random}`;
  quest.status = "Finished";
  quest.save();

  store.remove("Quest", id);
}
