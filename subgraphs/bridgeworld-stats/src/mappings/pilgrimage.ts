import { log } from "@graphprotocol/graph-ts";

import {
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";
import {
  getLegion,
  getOrCreateLegionStat,
  getOrCreateUser,
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

  const user = getOrCreateUser(params._user);
  user.pilgrimagesStarted += pilgrimagesCount;
  user.save();

  const stats = getTimeIntervalPilgrimageStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.pilgrimagesStarted += pilgrimagesCount;
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }

    if (!stat._allAddresses.includes(user.id)) {
      stat._allAddresses = stat._allAddresses.concat([user.id]);
      stat.allAddressesCount = stat._allAddresses.length;
    }

    stat.save();
  }
}

export function handlePilgrimagesFinished(event: PilgrimagesFinished): void {
  const params = event.params;
  const tokenIds = params._tokenIds;

  const user = getOrCreateUser(params._user);
  user.pilgrimagesFinished += tokenIds.length;
  user.save();
  const isUserPilgrimaging = user.pilgrimagesStarted > user.pilgrimagesFinished;

  const stats = getTimeIntervalPilgrimageStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.pilgrimagesFinished += tokenIds.length;
    if (!isUserPilgrimaging) {
      const addressIndex = stat._activeAddresses.indexOf(user.id);
      if (addressIndex >= 0) {
        const addresses = stat._activeAddresses;
        addresses.splice(addressIndex, 1);
        stat._activeAddresses = addresses;
        stat.activeAddressesCount = addresses.length;
      }
    }

    for (let j = 0; j < tokenIds.length; j++) {
      const legion = getLegion(tokenIds[j]);
      if (!legion) {
        log.error("[pilgrimage] Legion not found: {}", [
          tokenIds[j].toString(),
        ]);
        continue;
      }

      const legionStat = getOrCreateLegionStat(stat.id, legion, true);
      legionStat.pilgrimagesResulted += 1;
      legionStat.save();
    }

    stat.save();
  }
}
