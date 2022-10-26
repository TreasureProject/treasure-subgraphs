import { Approval as ApprovalEvent } from "../../generated/Magic/ERC20";
import { Approval, UserApproval } from "../../generated/schema";
import { getUser } from "../helpers/user";

export function handleApproval(event: ApprovalEvent): void {
  let params = event.params;

  let user = getUser(params.owner.toHexString());
  let contract = event.address;
  let spender = params.spender;

  let approvalId = `${contract.toHexString()}-${spender.toHexString()}`;
  let approval = Approval.load(approvalId);

  if (!approval) {
    approval = new Approval(approvalId);

    approval.contract = contract;
    approval.operator = spender;

    approval.save();
  }

  let userApprovalId = `${user.id}-${approval.id}`;

  if (!UserApproval.load(userApprovalId)) {
    let userApproval = new UserApproval(userApprovalId);

    userApproval.approval = approval.id;
    userApproval.user = user.id;

    userApproval.save();
  }
}
