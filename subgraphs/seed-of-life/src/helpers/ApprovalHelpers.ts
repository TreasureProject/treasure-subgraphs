import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Approval, User } from "../../generated/schema";

export class ApprovalHelpers {
  public static getOrCreateApproval(
    contract: Address,
    operator: Address
  ): Approval {
    let id = ApprovalHelpers.getApprovalId(contract, operator);
    let approval = Approval.load(id);
    if (!approval) {
      approval = new Approval(id);
      approval.contract = contract;
      approval.operator = operator;
      approval.save();
    }

    return approval;
  }

  public static getApprovalId(contract: Address, operator: Address): string {
    return `${contract.toHexString()}-${operator.toHexString()}`;
  }
}
