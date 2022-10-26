import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import { Token, UserToken } from "../generated/schema";
import { getAddressId, getImageHash, getName, getRarity } from "./helpers";
import { getUser } from "./helpers/user";

class Transfer {
  constructor(
    public contract: Address,
    public to: Address,
    public tokenId: BigInt
  ) {}
}

function getToken(data: Transfer): Token {
  let id = getAddressId(data.contract, data.tokenId);
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);

    let name = getName(data.tokenId);

    token.contract = data.contract;
    token.image = getImageHash(data.tokenId, name).split(" ").join("%20");
    token.name = name;
    token.rarity = getRarity(data.tokenId);
    token.tokenId = data.tokenId;
    token.save();
  }

  return token;
}

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
  let data = new Transfer(contract, to, tokenId);
  let user = getUser(data.to.toHexString());
  let token = getToken(data);

  let fromUserToken = UserToken.load(`${from.toHexString()}-${token.id}`);

  if (fromUserToken) {
    fromUserToken.quantity = fromUserToken.quantity.minus(quantity);
    fromUserToken.save();

    if (fromUserToken.quantity.toI32() == 0) {
      store.remove("UserToken", fromUserToken.id);
    }
  }

  let id = `${user.id}-${token.id}`;
  let toUserToken = UserToken.load(id);

  if (!toUserToken) {
    toUserToken = new UserToken(id);

    toUserToken.token = token.id;
    toUserToken.quantity = BigInt.zero();
    toUserToken.user = user.id;
  }

  toUserToken.quantity = toUserToken.quantity.plus(quantity);
  toUserToken.save();
}
