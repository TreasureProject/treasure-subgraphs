import { log } from "@graphprotocol/graph-ts";

import {
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";
import {
  getLegion,
  getOrCreateLegionStat,
  getOrCreateUserStat,
  getTimeIntervalPilgrimageStats,
} from "../helpers/models";

export function handlePilgrimagesStarted(event: PilgrimagesStarted): void {
  const params = event.params;
  const tokenIds = params._ids1155;
  const tokenAmounts = params._amounts1155;

  let pilgrimagesCount = 0;
  for (let i = 0; i < tokenIds.length; i++) {
    pilgrimagesCount += tokenAmounts[i].toI32();
  }

  const stats = getTimeIntervalPilgrimageStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.pilgrimagesStarted += pilgrimagesCount;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );

    if (userStat.pilgrimagesStarted == 0) {
      stat.allAddressesCount += 1;
    }

    if (userStat.pilgrimagesStarted == userStat.pilgrimagesFinished) {
      stat.activeAddressesCount += 1;
    }

    userStat.pilgrimagesStarted += pilgrimagesCount;
    userStat.save();

    stat.save();
  }
}

export function handlePilgrimagesFinished(event: PilgrimagesFinished): void {
  const params = event.params;
  const tokenIds = params._tokenIds;

  const stats = getTimeIntervalPilgrimageStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.pilgrimagesFinished += tokenIds.length;

    const userStat = getOrCreateUserStat(
      stat.id,
      params._user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.pilgrimagesFinished += tokenIds.length;
    userStat.save();

    if (userStat.pilgrimagesStarted == userStat.pilgrimagesFinished) {
      stat.activeAddressesCount = Math.max(
        stat.activeAddressesCount - 1,
        0
      ) as i32;
    }

    for (let j = 0; j < tokenIds.length; j++) {
      const legion = getLegion(tokenIds[j]);
      if (!legion) {
        log.error("[pilgrimage] Legion not found: {}", [
          tokenIds[j].toString(),
        ]);
        continue;
      }

      const legionStat = getOrCreateLegionStat(
        stat.id,
        legion,
        stat.startTimestamp,
        stat.endTimestamp,
        true
      );
      legionStat.pilgrimagesResulted += 1;
      legionStat.save();
    }

    stat.save();
  }
}
