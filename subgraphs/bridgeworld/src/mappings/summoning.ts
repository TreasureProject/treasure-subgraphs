import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import { Summon } from "../../generated/schema";
import { getLegionMetadata } from "../helpers/legion";
import { bigIntToBytes } from "../helpers/number";
import { getAddressId } from "../helpers/utils";

export function handleSummoningStarted(event: SummoningStarted): void {
  const params = event.params;
  const summon = new Summon(bigIntToBytes(params.tokenId));
  summon.user = params.user.toHexString();
  summon.token = getAddressId(LEGION_ADDRESS, params.tokenId);
  summon.status = "Revealable";
  summon.save();
}

export function handleSummoningFinished(event: SummoningFinished): void {
  const params = event.params;
  const summon = Summon.load(bigIntToBytes(params.returnedId));

  if (!summon) {
    log.error("[summoning] Finishing unknown summon: {}", [
      params.returnedId.toString(),
    ]);
    return;
  }

  if (params.newTokenId.gt(BigInt.zero())) {
    const summoningLegion = getLegionMetadata(params.returnedId);
    if (!summoningLegion) {
      log.error("[summoning] Finishing summon for unknown Legion: {}", [
        params.returnedId.toString(),
      ]);
      return;
    }

    summoningLegion.summons = summoningLegion.summons.plus(BigInt.fromI32(1));
    summoningLegion.save();
  }

  store.remove("Summon", summon.id.toHexString());
}
