import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { SMOL_BODIES_ADDRESS } from "@treasure/constants";

import {
  SmolStaked,
  SmolUnstaked,
} from "../../generated/Smol Racing/SmolRacing";
import { Token } from "../../generated/schema";

const getTokenType = (contract: Address): string =>
  contract.equals(SMOL_BODIES_ADDRESS) ? "SmolBodies" : "SmolBrains";

const getTokenId = (contract: Address, tokenId: BigInt): string =>
  `${contract.toHexString()}-${tokenId.toString()}`;

const getOrCreateToken = (contract: Address, tokenId: BigInt): Token => {
  const id = getTokenId(contract, tokenId);
  let token = Token.load(id);
  if (!token) {
    token = new Token(id);
    token.type = getTokenType(contract);
    token.contract = contract;
    token.tokenId = tokenId;
    token.save();
  }

  return token;
};

export function handleSmolStaked(event: SmolStaked): void {
  const params = event.params;
  const token = getOrCreateToken(params._smolAddress, params._tokenId);
  token.isStaked = true;
  token.save();
}

export function handleSmolUnstaked(event: SmolUnstaked): void {
  const params = event.params;

  const id = getTokenId(params._smolAddress, params._tokenId);
  const token = Token.load(id);
  if (!token) {
    log.error("[smol-racing] Unstaking unknown Token: {}", [id]);
    return;
  }

  token.isStaked = false;
  token.save();
}
