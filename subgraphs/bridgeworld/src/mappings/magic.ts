import { Approval as ApprovalEvent } from "../../generated/Magic/ERC20";
import { Approval, User, UserApproval } from "../../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let params = event.params;

  let userId = params.owner.toHexString();
  let user = User.load(userId);

  if (!user) {
    user = new User(userId);
    user.save();
  }

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
