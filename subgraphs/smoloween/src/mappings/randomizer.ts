import { Address, log, store } from "@graphprotocol/graph-ts";

import { SMOLOWEEN_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Random, Seeded } from "../../generated/schema";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const randomId = params._requestId.toString();

  if (
    !event.transaction.to ||
    (event.transaction.to as Address).notEqual(SMOLOWEEN_ADDRESS)
  ) {
    log.debug(
      "[randomizer] Skipping random request from unrelated contract: {}",
      [randomId]
    );
    return;
  }

  const random = new Random(randomId);
  random.save();

  const seededId = params._commitId.toString();
  let seeded = Seeded.load(seededId);
  if (seeded) {
    seeded.randoms = seeded.randoms.concat([randomId]);
  } else {
    seeded = new Seeded(seededId);
    seeded.randoms = [randomId];
  }

  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;
  const seededId = params._commitId.toString();

  const seeded = Seeded.load(seededId);
  if (!seeded) {
    log.debug("[randomizer] Skipping random seeded for unknown commit ID: {}", [
      seededId,
    ]);
    return;
  }

  for (let index = 0; index < seeded.randoms.length; index++) {
    const randomId = seeded.randoms[index];
    const random = Random.load(randomId);
    if (!random) {
      log.error("[randomizer] Unknown Random: {}", [randomId]);
      continue;
    }

    // const raceId = random.race;
    // if (raceId) {
    //   const race = Race.load(raceId as string);
    //   if (race) {
    //     race.status = "Claimable";
    //     race.save();

    //     store.remove("Random", randomId);
    //   } else {
    //     log.error("[randomizer] Unknown Race: {}", [raceId as string]);
    //   }

    //   continue;
    // }

    log.error("[randomizer] Unhandled Random: {}", [randomId]);
  }

  store.remove("Seeded", seededId);
}
