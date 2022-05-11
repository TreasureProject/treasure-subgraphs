import { Transfer } from "../generated/Magic/ERC20";
import {
  getOrCreateUserStat,
  getTimeIntervalMagicStats,
} from "./helpers/models";

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const value = params.value;

  const stats = getTimeIntervalMagicStats(event.block);

  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];

    stat.magicTransferred = stat.magicTransferred.plus(value);
    stat.magicTransferredCount += 1;

    const userReceivedStat = getOrCreateUserStat(
      stat.id,
      params.to,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );

    if (
      userReceivedStat.magicReceivedCount == 0 &&
      userReceivedStat.magicSentCount == 0
    ) {
      stat.allAddressesCount += 1;
    }

    userReceivedStat.magicReceived = userReceivedStat.magicReceived.plus(value);
    userReceivedStat.magicReceivedCount += 1;
    userReceivedStat.save();

    const userSentStat = getOrCreateUserStat(
      stat.id,
      params.from,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );

    if (
      userSentStat.magicReceivedCount == 0 &&
      userSentStat.magicSentCount == 0
    ) {
      stat.allAddressesCount += 1;
    }

    userSentStat.magicSent = userSentStat.magicSent.plus(value);
    userSentStat.magicSentCount += 1;
    userSentStat.save();

    stat.save();
  }
}
