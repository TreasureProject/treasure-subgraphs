import { log } from "@graphprotocol/graph-ts";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import {
  getLegion,
  getOrCreateLegionStat,
  getLegionSummonCost,
  getOrCreateUser,
  getTimeIntervalSummoningStats
} from "../helpers/models";

export function handleSummoningStarted(event: SummoningStarted): void {
  const params = event.params;

  const user = getOrCreateUser(params._user);
  user.summonsStarted += 1;
  user.save();

  const legion = getLegion(params._tokenId);
  if (!legion) {
    log.error("Legion not found: {}", [params._tokenId.toString()]);
  }

  const stats = getTimeIntervalSummoningStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.summonsStarted += 1;
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }

    if (!stat._allAddresses.includes(user.id)) {
      stat._allAddresses = stat._allAddresses.concat([user.id]);
      stat.allAddressesCount = stat._allAddresses.length;
    }

    if (legion) {
      const summonCost = getLegionSummonCost(legion.generation);
      stat.magicSpent = stat.magicSpent.plus(summonCost);

      const legionStat = getOrCreateLegionStat(stat.id, legion);
      if (!legionStat) {
        log.error("Legion not found: {}", [params._tokenId.toString()]);
        continue;
      }

      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.summoningStat = stat.id;
      legionStat.summoningMagicSpent = legionStat.summoningMagicSpent.plus(summonCost);
      legionStat.summonsStarted += 1;
      legionStat.save();
    }

    stat.save();
  }
}

export function handleSummoningFinished(event: SummoningFinished): void {
  const params = event.params;

  const user = getOrCreateUser(params._user);
  user.summonsFinished += 1;
  user.save();
  const isUserSummoning = user.summonsStarted > user.summonsFinished;

  const legion = getLegion(params._returnedId);
  if (!legion) {
    log.error("Legion not found: {}", [params._returnedId.toString()]);
  }

  const newLegion = getLegion(params._newTokenId);
  if (!legion) {
    log.error("Legion not found: {}", [params._newTokenId.toString()]);
  }

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

    if (legion) {
      const legionStat = getOrCreateLegionStat(stat.id, legion);
      legionStat.startTimestamp = stat.startTimestamp;
      legionStat.endTimestamp = stat.endTimestamp;
      legionStat.summonsFinished += 1;
      legionStat.save();
    }

    if (newLegion) {
      const newLegionStat = getOrCreateLegionStat(stat.id, newLegion);
      newLegionStat.startTimestamp = stat.startTimestamp;
      newLegionStat.endTimestamp = stat.endTimestamp;
      newLegionStat.summonedCount += 1;
      newLegionStat.save();
    }
  }
}
