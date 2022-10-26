import { newMockEvent } from "matchstick-as";

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { ApprovalForAll as ApprovalForAllERC721 } from "../../generated/Legion/ERC721";
import { Approval as ApprovalERC20 } from "../../generated/Magic/ERC20";
import { ApprovalForAll as ApprovalForAllERC1155 } from "../../generated/Treasure/ERC1155";

export const createApprovalAllERC1155Event = (
  address: string,
  account: string,
  operator: string,
  approved: boolean
): ApprovalForAllERC1155 => {
  const event = changetype<ApprovalForAllERC1155>(newMockEvent());
  event.address = Address.fromString(address);
  event.parameters = [
    new ethereum.EventParam(
      "account",
      ethereum.Value.fromAddress(Address.fromString(account))
    ),
    new ethereum.EventParam(
      "operator",
      ethereum.Value.fromAddress(Address.fromString(operator))
    ),
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved)),
  ];

  return event;
};

export const createApprovalAllERC721Event = (
  address: string,
  owner: string,
  operator: string,
  approved: boolean
): ApprovalForAllERC721 => {
  const event = changetype<ApprovalForAllERC721>(newMockEvent());
  event.address = Address.fromString(address);
  event.parameters = [
    new ethereum.EventParam(
      "owner",
      ethereum.Value.fromAddress(Address.fromString(owner))
    ),
    new ethereum.EventParam(
      "operator",
      ethereum.Value.fromAddress(Address.fromString(operator))
    ),
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved)),
  ];

  return event;
};

export const createApprovalERC20Event = (
  address: string,
  owner: string,
  spender: string,
  value: i32
): ApprovalERC20 => {
  const event = changetype<ApprovalERC20>(newMockEvent());
  event.address = Address.fromString(address);
  event.parameters = [
    new ethereum.EventParam(
      "owner",
      ethereum.Value.fromAddress(Address.fromString(owner))
    ),
    new ethereum.EventParam(
      "spender",
      ethereum.Value.fromAddress(Address.fromString(spender))
    ),
    new ethereum.EventParam("value", ethereum.Value.fromI32(value)),
  ];

  return event;
};
