import { Bytes, log } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Craft, Random, Seeded } from "../../generated/schema";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;

  const seededId = Bytes.fromI32(params._commitId.toI32());
  let seeded = Seeded.load(seededId);
  if (!seeded) {
    seeded = new Seeded(seededId);
    seeded.randoms = [];
  }

  const random = new Random(Bytes.fromI32(params._requestId.toI32()));
  random.requestId = params._requestId;
  random.seeded = seededId;
  random.save();

  seeded.randoms = seeded.randoms.concat([random.id]);
  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;

  const seeded = Seeded.load(Bytes.fromI32(params._commitId.toI32()));
  if (!seeded) {
    log.error("[seeded] Unknown seeded: {}", [params._commitId.toHexString()]);
    return;
  }

  for (let index = 0; index < seeded.randoms.length; index++) {
    const id = seeded.randoms[index];
    const random = Random.load(id);
    if (!random) {
      log.error("[seeded] Unknown random: {}", [id.toHexString()]);
      continue;
    }

    const craftId = random.craft;
    if (craftId) {
      const craft = Craft.load(craftId);
      if (craft) {
        craft.status = "Revealable";
        craft.save();
      } else {
        log.error("[randomizer] Craft not found: {}", [craftId.toHexString()]);
      }

      continue;
    }
  }
}
