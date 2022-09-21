import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { SMOLOWEEN_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { Smoloween } from "../../generated/Smoloween/Smoloween";
import { Costume, Random, Seeded, Token } from "../../generated/schema";
import { getOrCreateConfig } from "../helpers/config";

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
      if (!token) {
        log.error("[randomizer] Unknown Token: {}", [tokenId as string]);
        continue;
      }

      const smoloween = Smoloween.bind(SMOLOWEEN_ADDRESS);
      const result = smoloween.try_getSmolCostume(BigInt.fromString(token.id));
      if (result.reverted) {
        log.error("[randomizer] Error calling getSmolCostume for token: {}", [
          token.id,
        ]);
        continue;
      }

      const costume = new Costume(token.id);
      costume.face = result.value[0];
      costume.smile = result.value[1];
      costume.hat = result.value[2];
      costume.item = result.value[3];
      costume.background = result.value[4];
      costume.save();

      token.costume = costume.id;
      token.save();

      store.remove("Random", randomId);
      continue;
    }

    const witchDay = random.witchDay;
    if (witchDay) {
      const smoloween = Smoloween.bind(SMOLOWEEN_ADDRESS);
      const result = smoloween.try_getWitchCostume(BigInt.fromI32(witchDay));
      if (result.reverted) {
        log.error("[randomizer] Error calling getWitchCostume", []);
        continue;
      }

      let costume = Costume.load("witch");
      if (!costume) {
        costume = new Costume("witch");
      }
      costume.face = result.value[0];
      costume.smile = result.value[1];
      costume.hat = result.value[2];
      costume.item = result.value[3];
      costume.background = result.value[4];
      costume.save();

      const config = getOrCreateConfig();
      config.witchCostume = costume.id;
      config.save();

      store.remove("Random", randomId);
      continue;
    }

    log.error("[randomizer] Unhandled Random: {}", [randomId]);
  }

  store.remove("Seeded", seededId);
}
