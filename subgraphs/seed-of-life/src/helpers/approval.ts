import { Address } from "@graphprotocol/graph-ts";

import { Approval } from "../../generated/schema";

function getApprovalId(contract: Address, operator: Address): string {
  return `${contract.toHexString()}-${operator.toHexString()}`;
}

export function getOrCreateApproval(
  contract: Address,
  operator: Address
): Approval {
  let id = getApprovalId(contract, operator);
  let approval = Approval.load(id);
  if (!approval) {
    approval = new Approval(id);
    approval.contract = contract;
    approval.operator = operator;
    approval.save();
  }

  return approval;
}
