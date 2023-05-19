import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import { Pair, Token, Transaction } from "../../generated/schema";
import {
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../../generated/templates/UniswapV2Pair/UniswapV2Pair";
import { TWO_BD, ZERO_BI } from "../const";
import { ONE_BI } from "../const";
import {
  generateTransactionItems,
  getDerivedMagic,
  getOrCreateFactory,
  getOrCreateLiquidityPosition,
  getOrCreateTransaction,
  getOrCreateUser,
  isMagic,
  populateTransactionItems,
  updateDayData,
  updatePairDayData,
} from "../helpers";
import { tokenAmountToBigDecimal } from "../utils";

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

  const token1 = Token.load(pair.token1);
  if (!token1) {
    log.error("Error burning Pair with unknown Token: {}", [
      pair.token1.toHexString(),
    ]);
    return;
  }

  const factory = getOrCreateFactory();

  let amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  if (token0.isNFT) {
    amount0 = amount0.truncate(0);
  }

  let amount1 = tokenAmountToBigDecimal(token1, params.amount1);
  if (token1.isNFT) {
    amount1 = amount1.truncate(0);
  }

  const amountUSD = amount0
    .times(token0.derivedMAGIC)
    .plus(amount1.times(token1.derivedMAGIC))
    .times(factory.magicUSD);

  // Update Token 0
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.save();

  // Update Token 1
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.save();

  // Update Pair
  pair.txCount = pair.txCount.plus(ONE_BI);
  pair.save();

  // Update Factory
  factory.reserveUSD = factory.reserveUSD.minus(amountUSD);
  if (token0.isNFT) {
    factory.reserveNFT = factory.reserveNFT.minus(amount0);
  }
  if (token1.isNFT) {
    factory.reserveNFT = factory.reserveNFT.minus(amount1);
  }
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.save();

  // Update time interval stats
  updateDayData(event.block.timestamp);

  updatePairDayData(pair, event.block.timestamp);

  // Update Transaction
  const transaction = getOrCreateTransaction(event, "Withdrawal");
  transaction.user = getOrCreateUser(event.transaction.from).id; // TODO: handle case where swap result is sent to someone other than tx sender
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
  populateTransactionItems(transaction, pair);
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

  const token1 = Token.load(pair.token1);
  if (!token1) {
    log.error("Error minting Pair with unknown Token: {}", [
      pair.token1.toHexString(),
    ]);
    return;
  }

  const factory = getOrCreateFactory();

  const amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  const amount1 = tokenAmountToBigDecimal(token1, params.amount1);
  const amountUSD = amount0
    .times(token0.derivedMAGIC)
    .plus(amount1.times(token1.derivedMAGIC))
    .times(factory.magicUSD);

  // Update Token 0
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.save();

  // Update Token 1
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.save();

  // Update Pair
  pair.txCount = pair.txCount.plus(ONE_BI);
  pair.save();

  // Update Factory
  factory.reserveUSD = factory.reserveUSD.plus(amountUSD);
  if (token0.isNFT) {
    factory.reserveNFT = factory.reserveNFT.plus(amount0);
  }
  if (token1.isNFT) {
    factory.reserveNFT = factory.reserveNFT.plus(amount1);
  }
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.save();

  // Update time interval stats
  updateDayData(event.block.timestamp);

  updatePairDayData(pair, event.block.timestamp);

  // Update Transaction
  const transaction = getOrCreateTransaction(event, "Deposit");
  transaction.user = getOrCreateUser(event.transaction.from).id; // TODO: handle case where swap result is sent to someone other than tx sender
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
  populateTransactionItems(transaction, pair);
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

  const token1 = Token.load(pair.token1);
  if (!token1) {
    log.error("Error swapping unknown Token: {}", [pair.token1.toHexString()]);
    return;
  }

  const amount0 = tokenAmountToBigDecimal(
    token0,
    params.amount0In.plus(params.amount0Out)
  );
  const amount1 = tokenAmountToBigDecimal(
    token1,
    params.amount1In.plus(params.amount1Out)
  );

  const factory = getOrCreateFactory();

  const isAmount1Out = params.amount1Out.gt(ZERO_BI);
  const amount0Usd = amount0.times(token0.derivedMAGIC).times(factory.magicUSD);
  const amount1Usd = amount1.times(token1.derivedMAGIC).times(factory.magicUSD);
  const amountUSD = isAmount1Out ? amount0Usd : amount1Usd;

  // Update Token 0
  token0.volume = token0.volume.plus(amount0);
  token0.volumeUSD = token0.volumeUSD.plus(amount0Usd);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.save();

  // Update Token 1
  token1.volume = token1.volume.plus(amount1);
  token1.volumeUSD = token1.volumeUSD.plus(amount1Usd);
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.save();

  // Update Pair
  pair.volume0 = pair.volume0.plus(amount0);
  pair.volume1 = pair.volume1.plus(amount1);
  pair.volumeUSD = pair.volumeUSD.plus(amountUSD);
  pair.txCount = pair.txCount.plus(ONE_BI);
  pair.save();

  // Update Factory
  factory.volumeUSD = factory.volumeUSD.plus(amountUSD);
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.save();

  // Update time interval stats
  const dayData = updateDayData(event.block.timestamp);
  dayData.volumeUSD = dayData.volumeUSD.plus(amountUSD);
  dayData.save();

  const pairDayData = updatePairDayData(pair, event.block.timestamp);
  pairDayData.volume0 = pairDayData.volume0.plus(amount0);
  pairDayData.volume1 = pairDayData.volume1.plus(amount1);
  pairDayData.volumeUSD = pairDayData.volumeUSD.plus(amountUSD);
  pairDayData.save();

  // Log Transaction
  const transaction = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transaction.hash = event.transaction.hash;
  transaction.timestamp = event.block.timestamp;
  transaction.type = "Swap";
  transaction.user = getOrCreateUser(event.transaction.from).id; // TODO: handle case where swap result is sent to someone other than tx sender
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
  transaction.isAmount1Out = isAmount1Out;

  if (token0.isNFT || token1.isNFT) {
    const vaultTransaction = getOrCreateTransaction(event);

    // Replace Vault Transaction with this swap
    if (vaultTransaction._items && !vaultTransaction.pair) {
      const splitItems = generateTransactionItems(
        vaultTransaction._items as Bytes[],
        pair
      );

      if (splitItems[0].length > 0) {
        transaction.items0 = splitItems[0];
      }

      if (splitItems[1].length > 0) {
        transaction.items1 = splitItems[1];
      }

      store.remove("Transaction", vaultTransaction.id.toHexString());
    } else {
      vaultTransaction.swap = transaction.id;
      vaultTransaction.save();
    }
  }

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

  token0.derivedMAGIC = isToken1Magic
    ? pair.reserve1.div(pair.reserve0)
    : getDerivedMagic(token0);
  token0.save();

  token1.derivedMAGIC = isToken0Magic
    ? pair.reserve0.div(pair.reserve1)
    : getDerivedMagic(token1);
  token1.save();

  if (isToken0Magic) {
    pair.reserveUSD = pair.reserve0.times(factory.magicUSD).times(TWO_BD);
  } else if (isToken1Magic) {
    pair.reserveUSD = pair.reserve1.times(factory.magicUSD).times(TWO_BD);
  } else {
    pair.reserveUSD = pair.reserve0
      .times(token0.derivedMAGIC)
      .plus(pair.reserve1.times(token1.derivedMAGIC))
      .times(factory.magicUSD);
  }

  pair.save();
}

export function handleTransfer(event: Transfer): void {
  const params = event.params;
  const pair = Pair.load(event.address);
  if (!pair) {
    log.error("Error transferring unknown Pair: {}", [
      event.address.toHexString(),
    ]);
    return;
  }

  if (params.from.equals(Address.zero())) {
    // Minted
    pair.totalSupply = pair.totalSupply.plus(params.value);
    pair.save();
  } else if (
    params.to.equals(Address.zero()) &&
    params.from.equals(event.address)
  ) {
    // Burned
    pair.totalSupply = pair.totalSupply.minus(params.value);
    pair.save();
  }

  // Update Liquidity Positions
  if (
    params.from.notEqual(Address.zero()) &&
    params.from.notEqual(event.address)
  ) {
    const fromUser = getOrCreateUser(params.from);
    const fromLiquidityPosition = getOrCreateLiquidityPosition(pair, fromUser);
    const balance = fromLiquidityPosition.balance.minus(params.value);
    if (balance.le(ZERO_BI)) {
      // Remove Liquidity Position
      store.remove("LiquidityPosition", fromLiquidityPosition.id.toHexString());

      // Update User
      fromUser.liquidityPositionCount =
        fromUser.liquidityPositionCount.minus(ONE_BI);
      fromUser.save();
    } else {
      fromLiquidityPosition.balance = balance;
      fromLiquidityPosition.save();
    }
  }

  if (params.to.notEqual(Address.zero()) && params.to.notEqual(event.address)) {
    const toUser = getOrCreateUser(params.to);
    const toLiquidityPosition = getOrCreateLiquidityPosition(pair, toUser);

    // Update User
    if (toLiquidityPosition.balance.equals(ZERO_BI)) {
      toUser.liquidityPositionCount =
        toUser.liquidityPositionCount.plus(ONE_BI);
      toUser.save();
    }

    toLiquidityPosition.balance = toLiquidityPosition.balance.plus(
      params.value
    );
    toLiquidityPosition.save();
  }
}
