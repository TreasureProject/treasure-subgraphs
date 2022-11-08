import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { User } from "../../generated/schema";

export const getUser = (id: string): User => {
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.boost = "0";
    user.boosts = 0;
    user.deposited = BigInt.zero();
    user.finishedAdvancedQuestCount = 0;
    user.save();
  }

  return user;
};

export const getUserOrMultisigAddress = (event: ethereum.Event): Address => {
  const transaction = event.transaction;
  const to =
    transaction.to === null ? Address.zero() : (transaction.to as Address);
  const isMultisig = to.notEqual(event.address);
  return isMultisig ? to : transaction.from;
};
