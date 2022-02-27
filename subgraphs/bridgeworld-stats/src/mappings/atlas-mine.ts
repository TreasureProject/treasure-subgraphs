import {
  Deposit,
  Harvest,
  Withdraw,
} from "../../generated/Atlas Mine/AtlasMine";
import {
  getOrCreateAtlasMineLockStat,
  getOrCreateUser,
  getTimeIntervalAtlasMineStats,
} from "../helpers/models";

export function handleDeposit(event: Deposit): void {
  const params = event.params;

  const user = getOrCreateUser(params.user);
  user.magicDepositCount += 1;
  user.magicDeposited = user.magicDeposited.plus(params.amount);
  user.save();

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicDepositCount += 1;
    stat.magicDeposited = stat.magicDeposited.plus(params.amount);
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
    }

    if (!stat._allAddresses.includes(user.id)) {
      stat._allAddresses = stat._allAddresses.concat([user.id]);
      stat.allAddressesCount = stat._allAddresses.length;
    }

    stat.save();

    const lockStat = getOrCreateAtlasMineLockStat(stat.id, params.lock);
    lockStat.startTimestamp = stat.startTimestamp;
    lockStat.endTimestamp = stat.endTimestamp;
    lockStat.magicDepositCount += 1;
    lockStat.magicDeposited = lockStat.magicDeposited.plus(params.amount);
    lockStat.save();
  }
}

export function handleWithdraw(event: Withdraw): void {
  const params = event.params;

  const user = getOrCreateUser(params.user);
  user.magicWithdrawCount += 1;
  user.magicWithdrawn = user.magicWithdrawn.plus(params.amount);
  user.save();
  const isUserStaked = user.magicDeposited.gt(user.magicWithdrawn);

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicWithdrawCount += 1;
    stat.magicWithdrawn = stat.magicWithdrawn.plus(params.amount);
    if (!isUserStaked) {
      const addressIndex = stat._activeAddresses.indexOf(user.id);
      if (addressIndex >= 0) {
        const addresses = stat._activeAddresses;
        addresses.splice(addressIndex, 1);
        stat._activeAddresses = addresses;
        stat.activeAddressesCount = addresses.length;
      }
    }
    stat.save();
  }
}

export function handleHarvest(event: Harvest): void {
  const params = event.params;

  const user = getOrCreateUser(params.user);
  user.magicHarvestCount += 1;
  user.magicHarvested = user.magicHarvested.plus(params.amount);
  user.save();

  const stats = getTimeIntervalAtlasMineStats(event.block);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicHarvestCount += 1;
    stat.magicHarvested = stat.magicHarvested.plus(params.amount);
    stat.save();
  }
}
