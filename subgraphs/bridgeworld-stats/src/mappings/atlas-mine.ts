import {
  Deposit,
  Harvest,
  Withdraw,
} from "../../generated/Atlas Mine/AtlasMine";
import {
  getOrCreateAtlasMineLockStat,
  getOrCreateUserStat,
  getTimeIntervalAtlasMineStats,
} from "../helpers/models";

export function handleDeposit(event: Deposit): void {
  const params = event.params;

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicDepositCount += 1;
    stat.magicDeposited = stat.magicDeposited.plus(params.amount);

    const userStat = getOrCreateUserStat(
      stat.id,
      params.user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.magicDepositCount += 1;
    userStat.magicDeposited = userStat.magicDeposited.plus(params.amount);
    userStat.save();

    if (userStat.magicDepositCount == 1) {
      stat.activeAddressesCount += 1;
      stat.allAddressesCount += 1;
    }

    const lockStat = getOrCreateAtlasMineLockStat(
      stat.id,
      params.lock,
      stat.startTimestamp,
      stat.endTimestamp
    );
    lockStat.magicDepositCount += 1;
    lockStat.magicDeposited = lockStat.magicDeposited.plus(params.amount);
    lockStat.save();

    stat.save();
  }
}

export function handleWithdraw(event: Withdraw): void {
  const params = event.params;

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicWithdrawCount += 1;
    stat.magicWithdrawn = stat.magicWithdrawn.plus(params.amount);

    const userStat = getOrCreateUserStat(
      stat.id,
      params.user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.magicWithdrawCount += 1;
    userStat.magicWithdrawn = userStat.magicWithdrawn.plus(params.amount);
    userStat.save();

    if (userStat.magicDepositCount == userStat.magicWithdrawCount) {
      stat.activeAddressesCount -= 1;
    }

    stat.save();
  }
}

export function handleHarvest(event: Harvest): void {
  const params = event.params;

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicHarvestCount += 1;
    stat.magicHarvested = stat.magicHarvested.plus(params.amount);

    const userStat = getOrCreateUserStat(
      stat.id,
      params.user,
      stat.startTimestamp,
      stat.endTimestamp,
      stat.interval
    );
    userStat.magicHarvestCount += 1;
    userStat.magicHarvested = userStat.magicHarvested.plus(params.amount);
    userStat.save();

    stat.save();
  }
}
