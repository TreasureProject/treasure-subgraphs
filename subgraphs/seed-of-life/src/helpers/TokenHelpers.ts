import { Collection, Token } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export class TokenHelpers {

    public static getTokenId(collection: Collection, tokenId: BigInt): string {
        return [collection.id, tokenId.toHexString()].join("-");
    }

    public static getOrCreateToken(collection: Collection, tokenId: BigInt, name: string): Token {
        const id = TokenHelpers.getTokenId(collection, tokenId);
        let token = Token.load(id);

        if (!token) {
            token = new Token(id);
            token.collection = collection.id;
            token.name = name;
            token.tokenId = tokenId;
            token.save();
        }

        return token;
    }

}