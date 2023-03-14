import { log } from "@graphprotocol/graph-ts";

import { PairCreated } from "../../generated/UniswapV2Factory/UniswapV2Factory";
import { Pair, Token } from "../../generated/schema";
import { UniswapV2Pair } from "../../generated/templates";
import { Sync } from "../../generated/templates/Pair/UniswapV2Pair";
import { ZERO_BD } from "../const";
import { getOrCreateToken } from "../helpers";
import { tokenAmountToBigDecimal } from "../utils";

export function handlePairCreated(event: PairCreated): void {
  const params = event.params;

  const pair = new Pair(params.pair);
  pair.token0 = getOrCreateToken(params.token0).id;
  pair.token1 = getOrCreateToken(params.token1).id;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.save();

  UniswapV2Pair.create(params.pair);
}

export function handleSync(event: Sync): void {
  const params = event.params;

  const pair = Pair.load(event.address);
  if (!pair) {
    log.error("Error syncing unknown Pair: {}", [event.address.toHexString()]);
    return;
  }

  const token0 = Token.load(pair.token0);
  if (!token0) {
    log.error("Error syncing unknown base token: {}", [
      pair.token0.toHexString(),
    ]);
    return;
  }

  const token1 = Token.load(pair.token1);
  if (!token1) {
    log.error("Error syncing unknown quote token: {}", [
      pair.token1.toHexString(),
    ]);
    return;
  }

  pair.reserve0 = tokenAmountToBigDecimal(token0, params.reserve0);
  pair.reserve1 = tokenAmountToBigDecimal(token1, params.reserve1);
  pair.save();
}
