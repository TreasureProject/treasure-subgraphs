import { Address, ethereum } from "@graphprotocol/graph-ts";

export const getUserOrMultisigAddress = (event: ethereum.Event): Address => {
  const transaction = event.transaction;
  const to =
    transaction.to === null ? Address.zero() : (transaction.to as Address);
  const isMultisig = to.notEqual(event.address);
  return isMultisig ? to : transaction.from;
};
