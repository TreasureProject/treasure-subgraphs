import { log } from '@graphprotocol/graph-ts';

import { PairCreated } from '../../generated/UniswapFactory/UniswapV2Factory';
import { Pair } from '../../generated/schema';

export function handlePairCreated(event: PairCreated): void {
  const pair = new Pair(event.params.pair);
  pair.token0 = event.params.token0;
  pair.token1 = event.params.token1;
  pair.totalSupply = event.params.param3;
  pair.vault = event.address.toHexString();
  pair.save();

  log.info('pair saved from: {}, pair: {}, token0: {}, token1: {}', [
    event.address.toHexString(),
    pair.id.toHexString(),
    pair.token0.toHexString(),
    pair.token1.toHexString(),
  ]);
}
