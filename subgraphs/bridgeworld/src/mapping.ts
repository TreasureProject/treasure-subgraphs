import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { UserToken } from "../generated/schema";
import { ZERO_BI } from "./helpers/constants";
import { getOrCreateToken } from "./helpers/token";
import { getOrCreateUser } from "./helpers/user";

/**
 * This is a generic function that can handle both ERC1155s and ERC721s
 */
export function handleTransfer(
  contract: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  quantity: BigInt
): void {
  const token = getOrCreateToken(contract, tokenId);

  const fromUserToken = UserToken.load(from.concat(token.id));
  if (fromUserToken) {
    fromUserToken.quantity = fromUserToken.quantity.minus(quantity);
    fromUserToken.save();
    if (fromUserToken.quantity.equals(ZERO_BI)) {
      store.remove("UserToken", fromUserToken.id.toHexString());
    }
  }

  const user = getOrCreateUser(to);
  const toUserTokenId = user.id.concat(token.id);
  let toUserToken = UserToken.load(toUserTokenId);
  if (!toUserToken) {
    toUserToken = new UserToken(toUserTokenId);
    toUserToken.token = token.id;
    toUserToken.quantity = ZERO_BI;
    toUserToken.user = user.id;
  }

  toUserToken.quantity = toUserToken.quantity.plus(quantity);
  toUserToken.save();
}
