import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { SMOLOWEEN_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Smoloween } from "../../generated/Smoloween/Smoloween";
import { Random, Seeded, Token } from "../../generated/schema";

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

    const tokenId = random.token;
    if (tokenId) {
      const token = Token.load(tokenId as string);
      if (token) {
        const smoloween = Smoloween.bind(SMOLOWEEN_ADDRESS);
        const result = smoloween.try_getSmolCostume(
          BigInt.fromString(token.id)
        );
        if (result.reverted) {
          log.error("[randomizer] Error calling getSmolCostume for token: {}", [
            token.id,
          ]);
          continue;
        }

        token.faceTrait = result.value[0];
        token.smileTrait = result.value[1];
        token.hatTrait = result.value[2];
        token.itemTrait = result.value[3];
        token.backgroundTrait = result.value[4];
        token.save();

        store.remove("Random", randomId);
      } else {
        log.error("[randomizer] Unknown Token: {}", [tokenId as string]);
      }

      continue;
    }

    log.error("[randomizer] Unhandled Random: {}", [randomId]);
  }

  store.remove("Seeded", seededId);
}
