import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { MAGIC_ADDRESS } from ".";
import { Approval } from "../../generated/Magic/ERC20";

export const createApprovalEvent = (
  user: string,
  spender: Address,
  value: i32 = i32.MAX_VALUE
): Approval => {
  const newEvent = changetype<Approval>(newMockEvent());
  newEvent.address = Address.fromString(MAGIC_ADDRESS);
  newEvent.parameters = [
    new ethereum.EventParam(
      "owner",
      ethereum.Value.fromAddress(Address.fromString(user))
    ),
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender)),
    new ethereum.EventParam("value", ethereum.Value.fromI32(value)),
  ];

  return newEvent;
};
