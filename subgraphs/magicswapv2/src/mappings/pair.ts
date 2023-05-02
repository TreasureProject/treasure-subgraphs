import { Address, log } from "@graphprotocol/graph-ts";

import { PairCreated } from "../../generated/UniswapV2Factory/UniswapV2Factory";
import { Pair, Token, Transaction } from "../../generated/schema";
import { UniswapV2Pair } from "../../generated/templates";
import {
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../../generated/templates/UniswapV2Pair/UniswapV2Pair";
import { TWO_BD, ZERO_BD, ZERO_BI } from "../const";
import { ONE_BI } from "../const";
import {
  getDerivedMagic,
  getOrCreateFactory,
  getOrCreateToken,
  getOrCreateUser,
  isMagic,
} from "../helpers";
import { tokenAmountToBigDecimal } from "../utils";

export function handlePairCreated(event: PairCreated): void {
  const params = event.params;

  const token0 = getOrCreateToken(params.token0);
  const token1 = getOrCreateToken(params.token1);

  const pair = new Pair(params.pair);
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.reserveUsd = ZERO_BD;
  pair.totalSupply = ZERO_BI;
  pair.volume0 = ZERO_BD;
  pair.volume1 = ZERO_BD;
  pair.volumeUsd = ZERO_BD;
  pair.txCount = ZERO_BI;
  pair.save();

  const factory = getOrCreateFactory();
  factory.pairCount = factory.pairCount.plus(ONE_BI);
  factory.save();

  if (isMagic(token0)) {
    token1.magicPairs = token1.magicPairs.concat([pair.id]);
    token1.save();
  } else if (isMagic(token1)) {
    token0.magicPairs = token0.magicPairs.concat([pair.id]);
    token0.save();
  }

  UniswapV2Pair.create(params.pair);
}

export function handleBurn(event: Burn): void {
  const params = event.params;

  const pair = Pair.load(event.address);
  if (!pair) {
    log.error("Error burning unknown Pair: {}", [event.address.toHexString()]);
    return;
  }

  const token0 = Token.load(pair.token0);
  if (!token0) {
    log.error("Error burning Pair with unknown Token: {}", [
      pair.token0.toHexString(),
    ]);
    return;
  }

  const token1 = Token.load(pair.token0);
  if (!token1) {
    log.error("Error burning Pair with unknown Token: {}", [
      pair.token1.toHexString(),
    ]);
    return;
  }

  const amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  const amount1 = tokenAmountToBigDecimal(token1, params.amount1);

  // Update transaction counts
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pair.txCount = pair.txCount.plus(ONE_BI);

  const factory = getOrCreateFactory();
  factory.txCount = factory.txCount.plus(ONE_BI);

  // Save entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // Update transaction
  const transaction = Transaction.load(event.transaction.hash);
  if (!transaction) {
    log.error("Error update unknown burn Transaction: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUsd = amount0
    .times(token0.derivedMagic)
    .plus(amount1.times(token1.derivedMagic))
    .times(factory.magicUsd);
  transaction.save();
}

export function handleMint(event: Mint): void {
  const params = event.params;

  const pair = Pair.load(event.address);
  if (!pair) {
    log.error("Error minting unknown Pair: {}", [event.address.toHexString()]);
    return;
  }

  const token0 = Token.load(pair.token0);
  if (!token0) {
    log.error("Error minting Pair with unknown Token: {}", [
      pair.token0.toHexString(),
    ]);
    return;
  }

  const token1 = Token.load(pair.token0);
  if (!token1) {
    log.error("Error minting Pair with unknown Token: {}", [
      pair.token1.toHexString(),
    ]);
    return;
  }

  const amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  const amount1 = tokenAmountToBigDecimal(token1, params.amount1);

  // Update transaction counts
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pair.txCount = pair.txCount.plus(ONE_BI);

  const factory = getOrCreateFactory();
  factory.txCount = factory.txCount.plus(ONE_BI);

  // Save entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // Update transaction
  const transaction = Transaction.load(event.transaction.hash);
  if (!transaction) {
    log.error("Error update unknown mint Transaction: {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUsd = amount0
    .times(token0.derivedMagic)
    .plus(amount1.times(token1.derivedMagic))
    .times(factory.magicUsd);
  transaction.save();
}

export function handleSwap(event: Swap): void {
  const params = event.params;

  const pair = Pair.load(event.address);
  if (!pair) {
    log.error("Error swapping unknown Pair: {}", [event.address.toHexString()]);
    return;
  }

  const token0 = Token.load(pair.token0);
  if (!token0) {
    log.error("Error swapping unknown Token: {}", [pair.token0.toHexString()]);
    return;
  }

  const token1 = Token.load(pair.token0);
  if (!token1) {
    log.error("Error swapping unknown Token: {}", [pair.token1.toHexString()]);
    return;
  }

  const factory = getOrCreateFactory();

  const amount0 = tokenAmountToBigDecimal(
    token0,
    params.amount0In.plus(params.amount0Out)
  );
  const amount1 = tokenAmountToBigDecimal(
    token1,
    params.amount1In.plus(params.amount1Out)
  );

  // Update volume
  const volumeUsd0 = amount0.times(token0.derivedMagic).times(factory.magicUsd);
  const volumeUsd1 = amount1.times(token1.derivedMagic).times(factory.magicUsd);
  token0.volume = token0.volume.plus(amount0);
  token0.volumeUsd = token0.volumeUsd.plus(volumeUsd0);
  token1.volume = token1.volume.plus(amount1);
  token1.volumeUsd = token1.volumeUsd.plus(volumeUsd1);
  pair.volume0 = pair.volume0.plus(amount0);
  pair.volume1 = pair.volume1.plus(amount1);
  pair.volumeUsd = pair.volumeUsd.plus(volumeUsd0).plus(volumeUsd1);

  // Update transaction counts
  token0.txCount = token0.txCount.plus(ONE_BI);
  token1.txCount = token1.txCount.plus(ONE_BI);
  pair.txCount = pair.txCount.plus(ONE_BI);
  factory.txCount = factory.txCount.plus(ONE_BI);

  // Save entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // Log transaction
  const isAmount1Out = params.amount1Out.gt(ZERO_BI);
  const transaction = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.type = "Swap";
  transaction.user = getOrCreateUser(params.to).id;
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUsd = isAmount1Out
    ? amount0.times(token0.derivedMagic).times(factory.magicUsd)
    : amount1.times(token1.derivedMagic).times(factory.magicUsd);
  transaction.isAmount1Out = isAmount1Out;
  transaction.save();
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

  const factory = getOrCreateFactory();
  const isToken0Magic = isMagic(token0);
  const isToken1Magic = isMagic(token1);

  token0.derivedMagic = isToken1Magic
    ? pair.reserve1.div(pair.reserve0)
    : getDerivedMagic(token0);
  token1.derivedMagic = isToken0Magic
    ? pair.reserve0.div(pair.reserve1)
    : getDerivedMagic(token1);

  if (isToken0Magic) {
    pair.reserveUsd = pair.reserve0.times(factory.magicUsd).times(TWO_BD);
  } else if (isToken1Magic) {
    pair.reserveUsd = pair.reserve1.times(factory.magicUsd).times(TWO_BD);
  } else {
    pair.reserveUsd = pair.reserve0
      .times(token0.derivedMagic)
      .plus(pair.reserve1.times(token1.derivedMagic))
      .times(factory.magicUsd);
  }

  token0.save();
  token1.save();
  pair.save();
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;

  if (params.from.equals(Address.zero())) {
    const pair = Pair.load(event.address);
    if (!pair) {
      log.error("Error transferring unknown Pair: {}", [
        event.address.toHexString(),
      ]);
      return;
    }

    pair.totalSupply = pair.totalSupply.plus(params.value);
    pair.save();

    // Log transaction
    const transaction = new Transaction(event.transaction.hash);
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.type = "Deposit";
    transaction.user = getOrCreateUser(params.to).id;
    transaction.pair = pair.id;
    transaction.amount0 = ZERO_BD;
    transaction.amount1 = ZERO_BD;
    transaction.amountUsd = ZERO_BD;
    transaction.save();
  } else if (
    params.to.equals(Address.zero()) &&
    params.from.equals(event.address)
  ) {
    const pair = Pair.load(event.address);
    if (!pair) {
      log.error("Error transferring unknown Pair: {}", [
        event.address.toHexString(),
      ]);
      return;
    }

    pair.totalSupply = pair.totalSupply.minus(params.value);
    pair.save();

    // Log transaction
    const transaction = new Transaction(event.transaction.hash);
    transaction.hash = event.transaction.hash;
    transaction.timestamp = event.block.timestamp;
    transaction.type = "Withdrawal";
    transaction.user = getOrCreateUser(params.to).id;
    transaction.pair = pair.id;
    transaction.amount0 = ZERO_BD;
    transaction.amount1 = ZERO_BD;
    transaction.amountUsd = ZERO_BD;
    transaction.save();
  }
}
