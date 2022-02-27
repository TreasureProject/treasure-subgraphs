import { Address, BigInt, log, store } from "@graphprotocol/graph-ts";

import { Staking, Token, User, UserToken } from "../generated/schema";

class Transfer {
  contract: Address;
  to: Address;
  tokenId: BigInt;

  constructor(contract: Address, to: Address, tokenId: BigInt) {
    this.contract = contract;
    this.to = to;
    this.tokenId = tokenId;
  }
}

function getToken(data: Transfer): Token {
  let id = `${data.contract.toHexString()}-${data.tokenId.toHexString()}`;
  let token = Token.load(id);

  if (!token) {
    token = new Token(id);

    token.collection = data.contract.toHexString();
    token.staked = false;
    token.tokenId = data.tokenId;
    token.save();
  }

  return token;
}

function getUser(id: string): User {
  let user = User.load(id);

  if (!user) {
    user = new User(id);
    user.save();
  }

  return user;
}

function removeIfExist(entity: string, id: string): void {
  if (store.get(entity, id)) {
    store.remove(entity, id);
  }
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

  removeIfExist("UserToken", `${from.toHexString()}-${token.id}`);

  let id = `${user.id}-${token.id}`;
  let usertoken = UserToken.load(id);

  if (!usertoken) {
    usertoken = new UserToken(id);

    usertoken.token = token.id;
    usertoken.user = user.id;
  }

  usertoken.quantity = usertoken.quantity.plus(quantity);
  usertoken.save();
}

export function handleUnstake(address: Address, tokenId: BigInt): void {
  let staking = Staking.load(address.toHexString());

  if (!staking) {
    log.error("No staking entity found!", []);

    return;
  }

  let token = Token.load(`${staking.address}-${tokenId.toHexString()}`);

  if (!token) {
    log.error("tokenNotFound: Token for staking not found!", []);

    return;
  }

  token.staked = false;
  token.save();
}

export function handleStake(address: Address, tokenId: BigInt): void {
  let staking = Staking.load(address.toHexString());

  if (!staking) {
    log.error("No staking entity found!", []);

    return;
  }

  let token = Token.load(`${staking.address}-${tokenId.toHexString()}`);

  if (!token) {
    log.error("tokenNotFound: Token for staking not found!", []);

    return;
  }

  token.staked = true;
  token.save();
}

export function handleStakingSet(address: Address, contract: Address): void {
  let id = address.toHexString();
  let staking = Staking.load(id);

  if (!staking) {
    staking = new Staking(id);
  }

  staking.address = contract.toHexString();
  staking.save();
}
