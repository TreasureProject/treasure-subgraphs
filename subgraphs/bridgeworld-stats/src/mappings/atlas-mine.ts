import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
} from "../../generated/Atlas Mine/AtlasMine";
import {
  getOrCreateAtlasMineLockStat,
  getOrCreateUser,
  getTimeIntervalAtlasMineStats,
} from "../helpers/models";

export function handleDeposit(event: DepositEvent): void {
  const params = event.params;

  const user = getOrCreateUser(params.user);
  user.magicDepositCount += 1;
  user.magicDeposited = user.magicDeposited.plus(params.amount);
  user.save();

  const stats = getTimeIntervalAtlasMineStats(event.block.timestamp);
  for (let i = 0; i < stats.length; i++) {
    const stat = stats[i];
    stat.magicDepositCount += 1;
    stat.magicDeposited = stat.magicDeposited.plus(params.amount);
    if (!stat._activeAddresses.includes(user.id)) {
      stat._activeAddresses = stat._activeAddresses.concat([user.id]);
      stat.activeAddressesCount = stat._activeAddresses.length;
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

export function handleWithdraw(event: WithdrawEvent): void {
  const params = event.params;

  const user = getOrCreateUser(params.user);
  user.magicWithdrawCount += 1;
  user.magicWithdrawn = user.magicWithdrawn.plus(params.amount);
  user.save();
  const isUserStaked = user.magicDeposited.gt(user.magicWithdrawn);

  const stats = getTimeIntervalAtlasMineStats(event.block.timestamp);
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
