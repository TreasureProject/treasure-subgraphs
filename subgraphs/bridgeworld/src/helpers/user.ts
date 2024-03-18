import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

import { User } from "../../generated/schema";

export const getOrCreateUser = (address: Bytes): User => {
  let user = User.load(address);
  if (!user) {
    user = new User(address);
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
