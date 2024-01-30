import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Craft, Random, Seeded } from "../../generated/schema";
import { runScheduledJobs } from "../helpers/cron";

const getOrCreateSeeded = (commitId: BigInt): Seeded => {
  const seededId = Bytes.fromBigInt(commitId);
  let seeded = Seeded.load(seededId);
  if (!seeded) {
    seeded = new Seeded(seededId);
    seeded.save();
  }

  return seeded;
};

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;

  const seeded = getOrCreateSeeded(params._commitId);
  const random = new Random(Bytes.fromBigInt(params._requestId));
  random.requestId = params._requestId;
  random.seeded = seeded.id;
  random.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;

  const seeded = getOrCreateSeeded(params._commitId);
  const randoms = seeded.randoms.load();
  for (let index = 0; index < randoms.length; index++) {
    const random = randoms[index];
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

    store.remove("Random", random.id.toHexString());
  }

  store.remove("Seeded", seeded.id.toHexString());

  // Every time a random is seeded (~5 min), check scheduled jobs
  runScheduledJobs(event.block.timestamp);
}
