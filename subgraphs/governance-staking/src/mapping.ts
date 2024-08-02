import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import {
  Deposit,
  Withdraw,
} from "../generated/Governance Staking/GovernanceStaking";
import { User, UserBalance } from "../generated/schema";

const ZERO_BI = BigInt.zero();

const getOrCreateUser = (id: Address): User => {
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
};

const getOrCreateUserBalance = (user: User): UserBalance => {
  let balance = UserBalance.load(user.id);
  if (!balance) {
    balance = new UserBalance(user.id);
    balance.user = user.id;
    balance.balance = ZERO_BI;
  }

  return balance;
};

export function handleDeposit(event: Deposit): void {
  const user = getOrCreateUser(event.params.user);
  const balance = getOrCreateUserBalance(user);
  balance.balance = balance.balance.plus(event.params.amount);
  balance.save();
}

export function handleWithdraw(event: Withdraw): void {
  const user = getOrCreateUser(event.params.user);
  const balance = getOrCreateUserBalance(user);
  balance.balance = balance.balance.minus(event.params.amount);

  if (balance.balance.equals(ZERO_BI)) {
    store.remove("UserBalance", balance.id.toHexString());
    return;
  }

  balance.save();
}
