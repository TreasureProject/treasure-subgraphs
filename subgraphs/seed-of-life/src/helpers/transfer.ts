import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { UserToken } from "../../generated/schema";
import { getOrCreateCollection } from "./collection";
import { getOrCreateToken } from "./token";
import { getOrCreateUser } from "./user";

/**
 * This is a generic function that can handle both ERC1155s and ERC721s
 */
export function handleTransfer(
  contract: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  tokenName: string,
  quantity: BigInt
): void {
  let user = getOrCreateUser(to.toHexString());

  let collection = getOrCreateCollection(contract);
  let token = getOrCreateToken(collection, tokenId, tokenName);

  let fromUserToken = UserToken.load(`${from.toHexString()}-${token.id}`);

  if (fromUserToken) {
    fromUserToken.quantity = fromUserToken.quantity.minus(quantity);
    if (fromUserToken.quantity.toI32() == 0) {
      store.remove("UserToken", fromUserToken.id);
    } else {
      fromUserToken.save();
    }
  }

  let id = `${user.id}-${token.id}`;
  let toUserToken = UserToken.load(id);

  if (!toUserToken) {
    toUserToken = new UserToken(id);

    toUserToken.token = token.id;
    toUserToken.user = user.id;
  }

  toUserToken.quantity = toUserToken.quantity.plus(quantity);
  toUserToken.save();
}
