import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { ApprovalForAll as ApprovalForAllERC721 } from "../generated/Legion/ERC721";
import { Approval as ApprovalERC20 } from "../generated/Magic/ERC20";
import { ApprovalForAll as ApprovalForAllERC1155 } from "../generated/Treasure/ERC1155";
import { Approval } from "../generated/schema";

const handleApproval = (
  user: Address,
  contract: Address,
  operator: Address,
  approved: boolean,
  amount: BigInt | null = null
): void => {
  const id = `${contract.toHexString()}-${operator.toHexString()}-${user.toHexString()}`;
  if (approved) {
    let approval = Approval.load(id);
    if (!approval) {
      approval = new Approval(id);
      approval.user = user;
      approval.contract = contract;
      approval.operator = operator;
    }

    approval.approved = true;
    approval.amount = amount;
    approval.save();
  } else {
    store.remove("Approval", id);
  }
};

export function handleApprovalERC1155(event: ApprovalForAllERC1155): void {
  const params = event.params;
  handleApproval(
    params.account,
    event.address,
    params.operator,
    params.approved
  );
}

export function handleApprovalERC721(event: ApprovalForAllERC721): void {
  const params = event.params;
  handleApproval(params.owner, event.address, params.operator, params.approved);
}

export function handleApprovalERC20(event: ApprovalERC20): void {
  const params = event.params;
  const amount = params.value;
  handleApproval(
    params.owner,
    event.address,
    params.spender,
    amount.gt(BigInt.zero()),
    amount
  );
}
