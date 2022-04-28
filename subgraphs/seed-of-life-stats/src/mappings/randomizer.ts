import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { SEED_EVOLUTION_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { SeedEvolution } from "../../generated/SeedEvolution/SeedEvolution";
import { _Lifeform, _Random, _Seeded } from "../../generated/schema";
import { ONE_BI } from "../helpers/constants";
import { getLifeformClassByIndex } from "../helpers/lifeform";
import { getOrCreateRandom, getOrCreateSeeded } from "../helpers/random";
import { getOrCreateClassStat } from "../helpers/stat";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const random = getOrCreateRandom(params._requestId);
  const seeded = getOrCreateSeeded(params._commitId);
  seeded.randomIds = seeded.randomIds.concat([random.id]);
  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;

  const seededId = params._commitId.toHexString();
  const seeded = _Seeded.load(seededId);
  if (!seeded) {
    log.error("[randomizer] Unknown seeded: {}", [seededId]);
    return;
  }

  const randomIds = seeded.randomIds;
  for (let index = 0; index < randomIds.length; index++) {
    const randomId = randomIds[index];
    const random = _Random.load(randomId);
    if (!random) {
      log.error("[randomizer] Unknown random: {}", [randomId]);
      continue;
    }

    // Shared randomizer
    if (random.lifeformId) {
      const lifeformId = random.lifeformId as string;
      const lifeform = _Lifeform.load(lifeformId);
      if (!lifeform) {
        log.error("[randomizer] Unknown Lifeform: {}", [lifeformId]);
        continue;
      }

      const contract = SeedEvolution.bind(SEED_EVOLUTION_ADDRESS);
      const classCall = contract.try_classForLifeform(
        BigInt.fromI32(parseInt(lifeform.id, 16) as i32)
      );
      if (!classCall.reverted) {
        const lifeformClass = getLifeformClassByIndex(classCall.value);
        const classStat = getOrCreateClassStat(lifeformClass);
        classStat.lifeformTotal = classStat.lifeformTotal.plus(ONE_BI);
        classStat.save();
      }
    }

    store.remove("_Random", randomId);
  }

  store.remove("_Seeded", seededId);
}
