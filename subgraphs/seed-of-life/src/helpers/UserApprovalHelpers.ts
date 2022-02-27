import { Approval, User } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export class UserApprovalHelpers {

    public static getUserApprovalId(user: User, approval: Approval): string {
        return `${user.id}-${approval.id}`;
    }

}