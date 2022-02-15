import { log } from "@graphprotocol/graph-ts";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import {
  getOrCreateSummoningLegionStat,
  getOrCreateUser,
  getTimeIntervalSummoningStats
} from "../helpers/models";

export function handleSummoningStarted(event: SummoningStarted): void {
  
  const params = event.params;

  const user = getOrCreateUser(params._user);
  user.summonsStarted += 1;
  user.save();

  const stats = getTimeIntervalSummoningStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.summonsStarted += 1;
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }
    stat.save();

    const legionStat = getOrCreateSummoningLegionStat(stat.id, params._tokenId);
    if (!legionStat) {
      log.error("Legion not found: {}", [params._tokenId.toString()]);
      continue;
    }

    legionStat.startTimestamp = stat.startTimestamp;
    legionStat.endTimestamp = stat.endTimestamp;
    legionStat.summonsStarted += 1;
    legionStat.save();
  }
}

export function handleSummoningFinished(event: SummoningFinished): void {
  const params = event.params;

  const user = getOrCreateUser(params._user);
  user.summonsFinished += 1;
  user.save();
  const isUserSummoning = user.summonsStarted > user.summonsFinished;

  const stats = getTimeIntervalSummoningStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.summonsFinished += 1;
    if (!isUserSummoning) {
      const addressIndex = stat._activeAddresses.indexOf(user.id);
      if (addressIndex >= 0) {
        const addresses = stat._activeAddresses;
        addresses.splice(addressIndex, 1);
        stat._activeAddresses = addresses;
        stat.activeAddressesCount = addresses.length;
      }
    }
    stat.save();

    const legionStat = getOrCreateSummoningLegionStat(stat.id, params._returnedId);
    if (!legionStat) {
      log.error("Legion not found: {}", [params._returnedId.toString()]);
      continue;
    }

    legionStat.startTimestamp = stat.startTimestamp;
    legionStat.endTimestamp = stat.endTimestamp;
    legionStat.summonsFinished += 1;
    legionStat.save();

    const newLegionStat = getOrCreateSummoningLegionStat(stat.id, params._newTokenId);
    if (!newLegionStat) {
      log.error("Legion not found: {}", [params._newTokenId.toString()]);
      continue;
    }

    newLegionStat.startTimestamp = stat.startTimestamp;
    newLegionStat.endTimestamp = stat.endTimestamp;
    newLegionStat.summonedCount += 1;
    newLegionStat.save();
  }
}
