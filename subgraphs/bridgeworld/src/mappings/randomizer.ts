import { log } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Craft, Quest, Random, Seeded, Summon } from "../../generated/schema";
import { checkSummonFatigue } from "../helpers";

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

    if (summonId !== null) {
      let summon = Summon.load(summonId);

      if (summon) {
        summon.status = "Revealable";
        summon.save();

        continue;
      }
    }

    log.error("Unhandled seeded: {}", [commitId.toString()]);
  }
}
