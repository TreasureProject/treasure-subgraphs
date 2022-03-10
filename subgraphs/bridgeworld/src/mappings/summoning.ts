import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { CONSUMABLE_ADDRESS, LEGION_ADDRESS } from "@treasure/constants";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import {
  LegionInfo,
  Random,
  Summon,
  _SummonFatigue,
} from "../../generated/schema";
import {
  addSummonerToCircle,
  parse,
  removeSummonerFromCircle,
} from "../helpers";
import { getAddressId } from "../helpers/utils";

function getMetadataId(tokenId: BigInt): string {
  let id = getAddressId(LEGION_ADDRESS, tokenId);

  return `${id}-metadata`;
}

export function handleSummoningStarted(event: SummoningStarted): void {
  let params = event.params;
  let tokenId = params.tokenId;
  let requestId = params.requestId;
  let finishTime = params.finishTime;
  let user = params.user;

  let random = Random.load(requestId.toHexString());
  let summon = new Summon(getAddressId(event.address, tokenId));

  if (!random) {
    log.error("[summon-started] Unknown random: {}", [requestId.toString()]);

    return;
  }

  // let metadata = LegionInfo.load(getMetadataId(tokenId));

  // if (!metadata) {
  //   log.error("[summon-started] Unknown legion: {}", [tokenId.toString()]);

  //   return;
  // }

  addSummonerToCircle();

  // Parse input to get prism used
  let parsed = parse(event.transaction.input);
  let index = parsed.tokenIds.indexOf(tokenId);
  let prismId = parsed.prismIds[index];

  // metadata.summons = metadata.summons.plus(BigInt.fromI32(1));
  // metadata.save();

  summon.endTimestamp = finishTime.times(BigInt.fromI32(1000));
  summon.random = random.id;
  summon.status = "Idle";
  summon.token = getMetadataId(tokenId).replace("-metadata", "");
  summon.user = user.toHexString();

  if (!prismId.isZero()) {
    summon.prismUsed = getAddressId(CONSUMABLE_ADDRESS, prismId);
  }

  random.summon = summon.id;
  random.requestId = requestId;

  summon.save();
  random.save();
}

export function handleSummoningFinished(event: SummoningFinished): void {
  let params = event.params;
  let newTokenId = params.newTokenId;
  let existingTokenId = params.returnedId;
  let cooldown = params.summoningFatigue.times(BigInt.fromI32(1000));

  let id = getAddressId(event.address, params.returnedId);
  let summon = Summon.load(id);

  if (!summon) {
    log.error("Unknown summon: {}", [id]);

    return;
  }

  if (newTokenId.gt(BigInt.zero())) {
    let newLegion = LegionInfo.load(getMetadataId(newTokenId));

    if (!newLegion) {
      log.error("[summon-finished] Unknown new legion: {}", [
        newTokenId.toString(),
      ]);

      return;
    }

    newLegion.cooldown = cooldown;
    newLegion.save();

    let summoningLegion = LegionInfo.load(getMetadataId(existingTokenId));

    if (!summoningLegion) {
      log.error("[summon-finished] Unknown summoning legion: {}", [
        existingTokenId.toString(),
      ]);

      return;
    }

    summoningLegion.summons = summoningLegion.summons.plus(BigInt.fromI32(1));
    summoningLegion.save();

    // Store cooldown to clear later
    let fatigue = _SummonFatigue.load("all");

    if (!fatigue) {
      fatigue = new _SummonFatigue("all");

      // The first check will happen 5 minutes after the first cooldown.
      fatigue.timestamp = cooldown.plus(BigInt.fromI32(300_000));
    }

    fatigue.data = fatigue.data.concat([
      `${newLegion.id},${cooldown.toString()}`,
    ]);
    fatigue.save();

    // Add result token to summoning entity
    summon.resultToken = newLegion.id.replace("-metadata", "");
  }

  removeSummonerFromCircle();

  summon.id = `${summon.id}-${summon.random}`;
  summon.status = "Finished";
  summon.save();

  store.remove("Summon", id);
}
