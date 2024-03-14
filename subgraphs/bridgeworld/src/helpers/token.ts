import { Address, BigInt } from "@graphprotocol/graph-ts";

import { Token } from "../../generated/schema";
import { getAddressId } from "./utils";

export const getOrCreateToken = (contract: Address, tokenId: BigInt): Token => {
  const id = getAddressId(contract, tokenId);
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.contract = contract;
    token.tokenId = tokenId;
    token.image = "";
    token.name = "";
    token.rarity = "None";
    token.category = "Other";
    token.save();
  }

  return token;
};
