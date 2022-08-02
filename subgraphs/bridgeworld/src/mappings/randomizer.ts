import { BigInt, log } from "@graphprotocol/graph-ts";

import { SUMMONING_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Summoning } from "../../generated/Summoning/Summoning";
import {
  AdvancedQuest,
  Craft,
  Quest,
  Random,
  Seeded,
  Summon,
  Token,
} from "../../generated/schema";
import { setQuestEndTime } from "../helpers/advanced-questing";
import { runScheduledJobs } from "../helpers/cron";

function toI32(value: string): i32 {
  return parseInt(value, 16) as i32;
}

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const commitId = params._commitId.toHexString();
  const requestId = params._requestId.toHexString();

  const random = new Random(requestId);
  random.requestId = params._requestId;
  random.seeded = commitId;
  random.save();

  let seeded = Seeded.load(commitId);
  if (!seeded) {
    seeded = new Seeded(commitId);
    seeded.randoms = [];
  }

  seeded.randoms = seeded.randoms.concat([requestId]);
  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;
  const commitId = params._commitId;

  const seeded = Seeded.load(commitId.toHexString());
  if (!seeded) {
    log.error("[seeded] Unknown seeded: {}", [commitId.toHexString()]);
    return;
  }

  for (let index = 0; index < seeded.randoms.length; index++) {
    const id = seeded.randoms[index];
    const random = Random.load(id);
    if (!random) {
      log.error("[seeded] Unknown random: {}", [id]);
      continue;
    }

    const craftId = random.craft;
    if (craftId) {
      const craft = Craft.load(craftId);
      if (craft) {
        craft.status = "Revealable";
        craft.save();
      } else {
        log.error("[randomizer] Craft not found: {}", [craftId]);
      }

      continue;
    }

    const questId = random.quest;
    if (questId) {
      const quest = Quest.load(questId);
      if (quest) {
        quest.status = "Revealable";
        quest.save();
      } else {
        log.error("[randomizer] Quest not found: {}", [questId]);
      }

      continue;
    }

    const advancedQuestId = random.advancedQuest;
    if (advancedQuestId) {
      const quest = AdvancedQuest.load(advancedQuestId);
      if (quest !== null && quest.token !== null) {
        const token = Token.load(quest.token);
        if (token !== null) {
          const success = setQuestEndTime(quest, token.tokenId);
          if (!success) {
            log.error("[randomizer] Failed to get endTime for legion: {}", [
              quest.token,
            ]);
          }

          if (quest.stasisHitCount > 0) {
            if (quest.part === 2) {
              quest.hadStasisPart2 = true;
            } else if (quest.part === 3) {
              quest.hadStasisPart2 =
                quest.hadStasisPart2 || quest.stasisHitCount >= 2;
              quest.hadStasisPart3 = true;
            }
          }

          quest.save();
        } else {
          log.error("[randomizer] Token not found: {}", [quest.token]);
        }
      } else {
        log.error("[randomizer] AdvancedQuest not found: {}", [
          advancedQuestId,
        ]);
      }

      continue;
    }

    const summonId = random.summon;
    if (summonId) {
      const summon = Summon.load(summonId);
      if (summon) {
        let summoning = Summoning.bind(SUMMONING_ADDRESS);
        let tokenId = BigInt.fromI32(toI32(summon.token.slice(45)));
        let result = summoning.try_didSummoningSucceed(tokenId);

        if (!result.reverted) {
          summon.success = result.value.value0;
          summon.endTimestamp = result.value.value1.times(BigInt.fromI32(1000));
        }

        summon.status = "Revealable";
        summon.save();
      } else {
        log.error("[randomizer] Summon not found: {}", [summonId]);
      }

      continue;
    }

    log.error("Unhandled seeded: {}", [commitId.toString()]);
  }

  // Every time a random is seeded (~5 min), check scheduled jobs
  runScheduledJobs(event.block.timestamp);
}
