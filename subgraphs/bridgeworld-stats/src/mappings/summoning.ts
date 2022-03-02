import { log } from "@graphprotocol/graph-ts";

import {
  SummoningFinished,
  SummoningStarted,
} from "../../generated/Summoning/Summoning";
import {
  getLegion,
  getLegionSummonCost,
  getOrCreateLegionStat,
  getOrCreateUserStat,
  getTimeIntervalSummoningStats,
} from "../helpers/models";

export function handleSummoningStarted(event: SummoningStarted): void {
  const params = event.params;

  const legion = getLegion(params._tokenId);
  if (!legion) {
    log.error("[summoning] Legion not found: {}", [params._tokenId.toString()]);
  }

  const stats = getTimeIntervalSummoningStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.summonsStarted += 1;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );

    if (userStat.summonsStarted == 0) {
      stat.allAddressesCount += 1;
    }

    if (userStat.summonsStarted == userStat.summonsFinished) {
      stat.activeAddressesCount += 1;
    }

    userStat.summonsStarted += 1;
    userStat.save();

    if (legion) {
      const summonCost = getLegionSummonCost(legion.generation);
      stat.magicSpent = stat.magicSpent.plus(summonCost);

      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      legionStat.summoningStat = stat.id;
      legionStat.summoningMagicSpent =
        legionStat.summoningMagicSpent.plus(summonCost);
      legionStat.summonsStarted += 1;
      legionStat.save();
    }

    stat.save();
  }
}

export function handleSummoningFinished(event: SummoningFinished): void {
  const params = event.params;

  const legion = getLegion(params._returnedId);
  if (!legion) {
    log.error("[summoning] Legion not found: {}", [
      params._returnedId.toString(),
    ]);
  }

  const newLegion = getLegion(params._newTokenId);
  if (!legion) {
    log.error("[summoning] Legion not found: {}", [
      params._newTokenId.toString(),
    ]);
  }

  const stats = getTimeIntervalSummoningStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.summonsFinished += 1;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.summonsFinished += 1;
    userStat.save();

    if (userStat.summonsStarted == userStat.summonsFinished) {
      stat.activeAddressesCount = Math.max(
        stat.activeAddressesCount - 1,
        0
      ) as i32;
    }

    if (legion) {
      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      legionStat.summoningStat = stat.id;
      legionStat.summonsFinished += 1;
      legionStat.save();
    }

    if (newLegion) {
      const newLegionStat = getOrCreateLegionStat(
        stat.id,
        newLegion,
        stat.startTimestamp,
        stat.endTimestamp
      );
      newLegionStat.summoningStat = stat.id;
      newLegionStat.summonedCount += 1;
      newLegionStat.save();
    }

    stat.save();
  }
}
