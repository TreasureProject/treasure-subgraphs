import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import {
  _SummonFatigue,
  LegionInfo,
  Random,
  Summon,
} from "../../generated/schema";
import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import { getAddressId } from "../helpers/utils";

function getMetadataId(tokenId: BigInt): string {
  let id = getAddressId(LEGION_ADDRESS, tokenId);

  return `${id}-metadata`;
}

export function handleSummoningStarted(event: SummoningStarted): void {
  let params = event.params;
  let tokenId = params._tokenId;
  let requestId = params._requestId;
  let finishTime = params._finishTime;
  let user = params._user;

  let random = Random.load(requestId.toHexString());
  let summon = new Summon(getAddressId(event.address, tokenId));

  if (!random) {
    log.error("[summon-started] Unknown random: {}", [requestId.toString()]);

    return;
  }

  let metadata = LegionInfo.load(getMetadataId(tokenId));

  if (!metadata) {
    log.error("[summon-started] Unknown legion: {}", [tokenId.toString()]);

    return;
  }

  metadata.summons = metadata.summons.plus(BigInt.fromI32(1));
  metadata.save();

  summon.endTimestamp = finishTime.times(BigInt.fromI32(1000));
  summon.token = metadata.id.replace("-metadata", "");
  summon.random = random.id;
  summon.status = "Idle";
  summon.user = user.toHexString();

  random.summon = summon.id;
  random.requestId = requestId;

  summon.save();
  random.save();
}

export function handleSummoningFinished(event: SummoningFinished): void {
  let params = event.params;
  let tokenId = params._newTokenId;
  let cooldown = params._newTokenSummoningCooldown.times(BigInt.fromI32(1000));

  let id = getAddressId(event.address, params._returnedId);
  let metadata = LegionInfo.load(getMetadataId(tokenId));

  if (!metadata) {
    log.error("[summon-finished] Unknown legion: {}", [tokenId.toString()]);

    return;
  }

  metadata.cooldown = cooldown;
  metadata.save();

  // Store cooldown to clear later
  let fatigue = _SummonFatigue.load("all");

  if (!fatigue) {
    fatigue = new _SummonFatigue("all");

    // The first check will happen 5 minutes after the first cooldown.
    fatigue.timestamp = cooldown.plus(BigInt.fromI32(300_000));
  }

  fatigue.data = fatigue.data.concat([`${metadata.id},${cooldown.toString()}`]);
  fatigue.save();

  let summon = Summon.load(id);

  if (!summon) {
    log.error("Unknown summon: {}", [id]);

    return;
  }

  summon.id = `${summon.id}-${summon.random}`;
  summon.status = "Finished";
  summon.resultToken = metadata.id.replace("-metadata", "");
  summon.save();

  store.remove("Summon", id);
}
