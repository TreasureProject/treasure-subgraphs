import { Address, ethereum, log } from "@graphprotocol/graph-ts";

import { getBundle, getPair, getToken } from ".";
import {
  LiquidityPosition,
  LiquidityPositionSnapshot,
} from "../../generated/schema";

export function createLiquidityPositionSnapshot(
  position: LiquidityPosition,
  block: ethereum.Block
): void {
  const timestamp = block.timestamp.toI32();

  const id = position.id.concat("-").concat(timestamp.toString());

  const bundle = getBundle();

  const pair = getPair(Address.fromString(position.pair), block);
  if (!pair) {
    log.error("Unknown pair: {}", [position.pair]);
    return;
  }

  const token0 = getToken(Address.fromString(pair.token0));
  if (!token0) {
    log.error("Unknown token: {}", [pair.token0]);
    return;
  }

  const token1 = getToken(Address.fromString(pair.token1));
  if (!token1) {
    log.error("Unknown token: {}", [pair.token1]);
    return;
  }

  const snapshot = new LiquidityPositionSnapshot(id);

  snapshot.timestamp = timestamp;
  snapshot.block = block.number.toI32();
  snapshot.user = position.user;
  snapshot.pair = position.pair;
  snapshot.token0PriceUSD = token0.derivedETH.times(bundle.ethPrice);
  snapshot.token1PriceUSD = token1.derivedETH.times(bundle.ethPrice);
  snapshot.reserve0 = pair.reserve0;
  snapshot.reserve1 = pair.reserve1;
  snapshot.reserveUSD = pair.reserveUSD;
  snapshot.liquidityTokenTotalSupply = pair.totalSupply;
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance;
  snapshot.liquidityPosition = position.id;
  snapshot.save();
}
