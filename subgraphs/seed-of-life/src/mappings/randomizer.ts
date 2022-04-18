import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { SEED_EVOLUTION_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { SeedEvolution } from "../../generated/SeedEvolution/SeedEvolution";
import {
  ClaimLifeformRequest,
  Lifeform,
  Random,
  Seeded,
  UnstakeTokenRequest,
} from "../../generated/schema";
import { LifeformClass } from "../helpers/constants";
import {
  getOrCreateRandom,
  getOrCreateSeeded,
  getSeededId,
} from "../helpers/random";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;

  const random = getOrCreateRandom(params._requestId);
  const seeded = getOrCreateSeeded(params._commitId);

  seeded._randomIds = seeded._randomIds.concat([random.id]);
  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;

  const seededId = getSeededId(params._commitId);
  const seeded = Seeded.load(seededId);

  if (!seeded) {
    log.error("[Randomizer] Unknown seeded: {}", [seededId]);
    return;
  }

  const randomIds = seeded._randomIds;
  for (let index = 0; index < randomIds.length; index++) {
    const randomId = randomIds[index];
    const random = Random.load(randomId);
    if (!random) {
      log.error("[Randomizer] Unknown random: {}", [randomId]);
      continue;
    }

    // Shared randomizer
    if (random._claimLifeformRequestId) {
      const claimLifeformRequestId = random._claimLifeformRequestId as string;
      const claimLifeformRequest = ClaimLifeformRequest.load(
        claimLifeformRequestId
      );
      if (!claimLifeformRequest) {
        log.error("[Randomizer] Unknown claim lifeform request: {}", [
          claimLifeformRequestId,
        ]);
        continue;
      }

      claimLifeformRequest.status = "READY";
      claimLifeformRequest.save();
    } else if (random._unstakeTokenRequestId) {
      const unstakeTokenRequestId = random._unstakeTokenRequestId as string;
      const unstakeTokenRequest = UnstakeTokenRequest.load(
        unstakeTokenRequestId
      );
      if (!unstakeTokenRequest) {
        log.error("[Randomizer] Unknown unstake token request: {}", [
          unstakeTokenRequestId,
        ]);
        continue;
      }

      unstakeTokenRequest.status = "READY";
      unstakeTokenRequest.save();
    } else if (random._lifeformId) {
      const lifeformId = random._lifeformId as string;
      const lifeform = Lifeform.load(lifeformId);
      if (!lifeform) {
        log.error("[Randomizer] Unknown lifeform: {}", [lifeformId]);
        continue;
      }

      const contract = SeedEvolution.bind(SEED_EVOLUTION_ADDRESS);
      const classCall = contract.try_classForLifeform(
        BigInt.fromI32(parseInt(lifeform.id, 16) as i32)
      );
      if (!classCall.reverted) {
        lifeform.lifeformClass = LifeformClass.getName(classCall.value);
      }
      lifeform.save();
    }

    store.remove("Random", randomId);
  }

  store.remove("Seeded", seededId);
}
