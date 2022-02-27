import { Collection, Token, User } from "../../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export class UserHelpers {

    public static getOrCreateUser(id: string): User {
        let user = User.load(id);
        if (!user) {
            user = new User(id);
            user.save();
        }

        return user;
    }

}