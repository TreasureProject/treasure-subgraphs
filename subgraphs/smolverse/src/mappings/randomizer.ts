import { Claim, Random, Seeded } from "../../generated/schema";
import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { log, store } from "@graphprotocol/graph-ts";
import { getOrCreateRandom, getOrCreateSeeded } from "../helpers/models";
import { getSeededId } from "../helpers/ids";

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
    log.error("[randomizer] Unknown seeded: {}", [seededId]);
    return;
  }

  const randomIds = seeded._randomIds;
  for (let index = 0; index < randomIds.length; index++) {
    const randomId = randomIds[index];
    const random = Random.load(randomId);
    if (!random) {
      log.error("[randomizer] Unknown random: {}", [randomId]);
      continue;
    }

    const claimId = random._claimId;
    const claim = Claim.load(claimId);
    if (!claim) {
      log.error("[seeded] Unknown claim: {}", [claimId]);
      continue;
    }

    claim.status = "Revealable";
    claim.save();

    store.remove("Random", randomId);
  }

  store.remove("Seeded", seededId);
}
