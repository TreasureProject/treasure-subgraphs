import { Address, ethereum } from "@graphprotocol/graph-ts";

import {
  MAGICSWAP_FACTORY_ADDRESS,
  MAGICSWAP_TOKEN_WHITELIST,
} from "@treasure/constants";

import { getToken } from ".";
import { Pair } from "../../generated/schema";
import { Pair as PairContract } from "../../generated/templates/Pair/Pair";

export function getPair(
  address: Address,
  block: ethereum.Block | null = null,
  token0FromParams: Address | null = null,
  token1FromParams: Address | null = null
): Pair | null {
  let pair = Pair.load(address.toHex());

  if (pair === null) {
    const pairContract = PairContract.bind(address);

    const token0Address = token0FromParams || pairContract.token0();
    const token0 = getToken(token0Address as Address);

    if (token0 === null) {
      return null;
    }

    const token1Address = token1FromParams || pairContract.token1();
    const token1 = getToken(token1Address as Address);

    if (token1 === null) {
      return null;
    }

    pair = new Pair(address.toHex());

    if (MAGICSWAP_TOKEN_WHITELIST.includes(token0.id)) {
      const newPairs = token1.whitelistPairs;
      newPairs.push(pair.id);
      token1.whitelistPairs = newPairs;
    }
    if (MAGICSWAP_TOKEN_WHITELIST.includes(token1.id)) {
      const newPairs = token0.whitelistPairs;
      newPairs.push(pair.id);
      token0.whitelistPairs = newPairs;
    }

    token0.save();
    token1.save();

    pair.factory = MAGICSWAP_FACTORY_ADDRESS.toHex();
    pair.name = token0.symbol.concat("-").concat(token1.symbol);
    pair.token0 = token0.id;
    pair.token1 = token1.id;
    if (block) {
      pair.timestamp = block.timestamp;
      pair.block = block.number;
    }
  }

  return pair as Pair;
}
