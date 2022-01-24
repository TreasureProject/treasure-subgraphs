import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import { LegionInfo, Random, Summon } from "../../generated/schema";
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
  let cooldown = params._newTokenSummoningCooldown;

  let id = getAddressId(event.address, params._returnedId);
  let metadata = LegionInfo.load(getMetadataId(tokenId));

  if (!metadata) {
    log.error("[summon-finished] Unknown legion: {}", [tokenId.toString()]);

    return;
  }

  metadata.cooldown = cooldown.times(BigInt.fromI32(1000));
  metadata.save();

  let summon = Summon.load(id);

  if (!summon) {
    log.error("Unknown summon: {}", [id]);

    return;
  }

  summon.id = `${summon.id}-${summon.random}`;
  summon.status = "Finished";
  summon.save();

  store.remove("Summon", id);
}
