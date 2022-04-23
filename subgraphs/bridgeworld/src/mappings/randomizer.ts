import { BigInt, log } from "@graphprotocol/graph-ts";

import {
  ADVANCED_QUESTING_ADDRESS,
  LEGION_ADDRESS,
  SUMMONING_ADDRESS,
} from "@treasure/constants";

import { AdvancedQuesting } from "../../generated/Advanced Questing/AdvancedQuesting";
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
import { checkSummonFatigue, getAddressId } from "../helpers";

function toI32(value: string): i32 {
  return parseInt(value, 16) as i32;
}

export function handleRandomRequest(event: RandomRequest): void {
  let params = event.params;
  let commitId = params._commitId.toHexString();
  let requestId = params._requestId.toHexString();

  let random = new Random(requestId);

  random.seeded = commitId;
  random.save();

  let seeded = Seeded.load(commitId);

  if (!seeded) {
    seeded = new Seeded(commitId);

    seeded.randoms = [];
  }

  seeded.randoms = seeded.randoms.concat([requestId]);
  seeded.save();

  // Every random request, check about clearing summoning fatigue
  checkSummonFatigue(event.block.timestamp.toI64() * 1000);
}

export function handleRandomSeeded(event: RandomSeeded): void {
  let params = event.params;
  let commitId = params._commitId;

  let seeded = Seeded.load(commitId.toHexString());

  if (!seeded) {
    log.error("[seeded] Unknown seeded: {}", [commitId.toHexString()]);

    return;
  }

  let randoms = seeded.randoms;

  for (let index = 0; index < randoms.length; index++) {
    let id = randoms[index];
    let random = Random.load(id);

    if (!random) {
      log.error("[seeded] Unknown random: {}", [id]);

      return;
    }

    let craftId = random.craft;
    let questId = random.quest;
    let summonId = random.summon;

    if (craftId !== null) {
      let craft = Craft.load(craftId);

      if (craft) {
        craft.status = "Revealable";
        craft.save();

        continue;
      }
    }

    if (questId !== null) {
      let quest = Quest.load(questId);

      if (quest) {
        quest.status = "Revealable";
        quest.save();

        continue;
      }
    }

    if (random.advancedQuest != null) {
      const quest = AdvancedQuest.load(random.advancedQuest);
      const token = Token.load(quest.token);

      if (quest && token) {
        const advancedQuesting = AdvancedQuesting.bind(
          ADVANCED_QUESTING_ADDRESS
        );
        const endTimeResult = advancedQuesting.try_endTimeForLegion(
          token.tokenId
        );

        if (!endTimeResult.reverted) {
          quest.endTimestamp = endTimeResult.value.value0.times(
            BigInt.fromI32(1000)
          );
          quest.stasisHitCount = endTimeResult.value.value1;
        } else {
          log.error(
            "[advanced-quest-random] Failed to get endTime for legion: {}",
            [quest.token]
          );
        }

        continue;
      } else {
        log.error(
          "[advanced-quest-random] Failed to update endTime during random seed: {}",
          [random.id]
        );
      }
    }

    if (summonId !== null) {
      let summon = Summon.load(summonId);

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

        continue;
      }
    }

    log.error("Unhandled seeded: {}", [commitId.toString()]);
  }
}
