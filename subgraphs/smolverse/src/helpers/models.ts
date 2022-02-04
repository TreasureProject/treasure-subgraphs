import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import { SmolBodiesPet, User } from "../../generated/schema";
import { getTokenId } from "./ids";

export function getOrCreateUser(id: string): User {
  let user = User.load(id);

  if (!user) {
    user = new User(id);
  }

  return user;
}

export function getOrCreateSmolBodiesPet(tokenId: BigInt): SmolBodiesPet {
  const id = getTokenId(SMOL_BODIES_PETS_ADDRESS, tokenId);
  let token = SmolBodiesPet.load(id);
  
  if (!token) {
    token = new SmolBodiesPet(id);
    token.tokenId = tokenId;
  }

  return token;
}
