import { log } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Craft, Random, Seeded } from "../../generated/schema";

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
  }
}
