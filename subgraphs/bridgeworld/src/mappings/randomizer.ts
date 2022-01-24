import { Craft, Quest, Random, Seeded, Summon } from "../../generated/schema";
import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { log } from "@graphprotocol/graph-ts";

export function handleRandomRequest(event: RandomRequest): void {
  let params = event.params;
  let commitId = params._commitId;
  let requestId = params._requestId.toHexString();

  new Random(requestId).save();

  let seeded = new Seeded(commitId.toHexString());

  seeded.random = requestId;
  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  let params = event.params;
  let commitId = params._commitId;

  let seeded = Seeded.load(commitId.toHexString());

  if (!seeded) {
    log.error("[seeded] Unknown seeded: {}", [commitId.toHexString()]);

    return;
  }

  let random = Random.load(seeded.random);

  if (!random) {
    log.error("[seeded] Unknown random: {}", [seeded.random]);

    return;
  }

  let craftId = random.craft;
  let questId = random.quest;
  let summonId = random.summon;

  log.info(
    "[seeded] commitId: {}, seeded.random: {}, craftId: {}, questId: {}, summonId: {}, tx: {}",
    [
      commitId.toString(),
      seeded.random,
      craftId ? craftId : "null",
      questId ? questId : "null",
      summonId ? summonId : "null",
      event.transaction.hash.toHexString()
    ]
  );

  if (craftId !== null) {
    let craft = Craft.load(craftId);

    if (craft) {
      craft.status = "Revealable";
      craft.save();

      return;
    }
  }

  if (questId !== null) {
    let quest = Quest.load(questId);

    if (quest) {
      quest.status = "Revealable";
      quest.save();

      return;
    }
  }

  if (summonId !== null) {
    let summon = Summon.load(summonId);

    if (summon) {
      summon.status = "Revealable";
      summon.save();

      return;
    }
  }

  log.error("Unhandled seeded: {}", [commitId.toString()]);
}
