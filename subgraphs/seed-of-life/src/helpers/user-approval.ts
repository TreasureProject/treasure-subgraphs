import { Approval, User } from "../../generated/schema";

export function getUserApprovalId(user: User, approval: Approval): string {
  return `${user.id}-${approval.id}`;
}
