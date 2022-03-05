import { BigInt } from "@graphprotocol/graph-ts";

import { Approval, User } from "../../generated/schema";

export class UserApprovalHelpers {
  public static getUserApprovalId(user: User, approval: Approval): string {
    return `${user.id}-${approval.id}`;
  }
}
