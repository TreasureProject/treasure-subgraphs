import { Approval as ApprovalEvent } from "../../generated/Magic/ERC20";
import { Approval, User, UserApproval } from "../../generated/schema";
import { ApprovalHelpers } from "../helpers/ApprovalHelpers";
import { UserApprovalHelpers } from "../helpers/UserApprovalHelpers";
import { UserHelpers } from "../helpers/UserHelpers";

export function handleApproval(event: ApprovalEvent): void {
  let user = UserHelpers.getOrCreateUser(event.params.owner.toHexString());

  let contract = event.address;
  let spender = event.params.spender;

  let approval = ApprovalHelpers.getOrCreateApproval(contract, spender);

  let userApprovalId = UserApprovalHelpers.getUserApprovalId(user, approval);

  if (UserApproval.load(userApprovalId)) {
    return;
  }
  let userApproval = new UserApproval(userApprovalId);

  userApproval.approval = approval.id;
  userApproval.user = user.id;

  userApproval.save();
}
