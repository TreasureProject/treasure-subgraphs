import { Approval as ApprovalEvent } from "../../generated/Magic/ERC20";
import { UserApproval } from "../../generated/schema";
import { getOrCreateApproval } from "../helpers/approval";
import { getOrCreateUser } from "../helpers/user";
import { getUserApprovalId } from "../helpers/user-approval";

export function handleApproval(event: ApprovalEvent): void {
  let user = getOrCreateUser(event.params.owner.toHexString());

  let contract = event.address;
  let spender = event.params.spender;

  let approval = getOrCreateApproval(contract, spender);

  let userApprovalId = getUserApprovalId(user, approval);

  if (UserApproval.load(userApprovalId)) {
    return;
  }
  let userApproval = new UserApproval(userApprovalId);

  userApproval.approval = approval.id;
  userApproval.user = user.id;

  userApproval.save();
}
