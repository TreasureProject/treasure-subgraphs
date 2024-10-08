import { Address, log, store } from "@graphprotocol/graph-ts";

import { MAGICSWAP_V2_ROUTER_ADDRESS } from "@treasure/constants";

import { Pair, Token } from "../../generated/schema";
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
  getMagicUSD,
  getOrCreateFactory,
  getOrCreateLiquidityPosition,
  getOrCreateTransaction,
  getOrCreateUser,
  updateDayData,
  updateHourData,
  updatePairDayData,
  updatePairHourData,
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

  let amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  if (token0.isNFT) {
    amount0 = amount0.truncate(0);
  }

  let amount1 = tokenAmountToBigDecimal(token1, params.amount1);
  if (token1.isNFT) {
    amount1 = amount1.truncate(0);
  }

  const magicUSD = getMagicUSD();
  let amountUSD = ZERO_BD;
  if (token0.derivedMAGIC > ZERO_BD) {
    amountUSD = amount0
      .times(token0.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
  } else if (token1.derivedMAGIC > ZERO_BD) {
    amountUSD = amount1
      .times(token1.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
  }

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
  const factory = getOrCreateFactory(pair.factory);
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
  updateHourData(factory, event.block.timestamp);
  updatePairHourData(pair, event.block.timestamp);
  updateDayData(factory, event.block.timestamp);
  updatePairDayData(pair, event.block.timestamp);

  // Update Transaction
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Withdrawal";
  if (!transaction.user) {
    transaction.user = getOrCreateUser(params.to).id;
  }
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
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

  const amount0 = tokenAmountToBigDecimal(token0, params.amount0);
  const amount1 = tokenAmountToBigDecimal(token1, params.amount1);

  const magicUSD = getMagicUSD();
  let amountUSD = ZERO_BD;
  if (token0.derivedMAGIC > ZERO_BD) {
    amountUSD = amount0
      .times(token0.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
  } else if (token1.derivedMAGIC > ZERO_BD) {
    amountUSD = amount1
      .times(token1.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
  }

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
  const factory = getOrCreateFactory(pair.factory);
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
  updateHourData(factory, event.block.timestamp);
  updatePairHourData(pair, event.block.timestamp);
  updateDayData(factory, event.block.timestamp);
  updatePairDayData(pair, event.block.timestamp);

  // Update Transaction
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Deposit";
  if (!transaction.user) {
    transaction.user = getOrCreateUser(params.sender).id;
  }
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
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

  const magicUSD = getMagicUSD();
  const isAmount1Out = params.amount1Out.gt(ZERO_BI);
  const amount0USD = amount0.times(token0.derivedMAGIC).times(magicUSD);
  const amount1USD = amount1.times(token1.derivedMAGIC).times(magicUSD);
  let amountUSD = isAmount1Out ? amount0USD : amount1USD;
  if (amountUSD.equals(ZERO_BD)) {
    amountUSD = amount1USD.gt(ZERO_BD) ? amount1USD : amount0USD;
  }

  // Update Token 0
  token0.volume = token0.volume.plus(amount0);
  token0.volumeUSD = token0.volumeUSD.plus(amount0USD);
  token0.txCount = token0.txCount.plus(ONE_BI);
  token0.save();

  // Update Token 1
  token1.volume = token1.volume.plus(amount1);
  token1.volumeUSD = token1.volumeUSD.plus(amount1USD);
  token1.txCount = token1.txCount.plus(ONE_BI);
  token1.save();

  // Update Pair
  pair.volume0 = pair.volume0.plus(amount0);
  pair.volume1 = pair.volume1.plus(amount1);
  pair.volumeUSD = pair.volumeUSD.plus(amountUSD);
  pair.txCount = pair.txCount.plus(ONE_BI);
  pair.save();

  // Update Factory
  const factory = getOrCreateFactory(pair.factory);
  factory.volumeUSD = factory.volumeUSD.plus(amountUSD);
  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.save();

  // Update time interval stats
  const hourData = updateHourData(factory, event.block.timestamp);
  hourData.volumeUSD = hourData.volumeUSD.plus(amountUSD);
  hourData.save();

  const pairHourData = updatePairHourData(pair, event.block.timestamp);
  pairHourData.volume0 = pairHourData.volume0.plus(amount0);
  pairHourData.volume1 = pairHourData.volume1.plus(amount1);
  pairHourData.volumeUSD = pairHourData.volumeUSD.plus(amountUSD);
  pairHourData.save();

  const dayData = updateDayData(factory, event.block.timestamp);
  dayData.volumeUSD = dayData.volumeUSD.plus(amountUSD);
  dayData.save();

  const pairDayData = updatePairDayData(pair, event.block.timestamp);
  pairDayData.volume0 = pairDayData.volume0.plus(amount0);
  pairDayData.volume1 = pairDayData.volume1.plus(amount1);
  pairDayData.volumeUSD = pairDayData.volumeUSD.plus(amountUSD);
  pairDayData.save();

  // Log Transaction
  const transaction = getOrCreateTransaction(event);
  transaction.type = "Swap";
  if (!transaction.user) {
    if (!params.to.equals(MAGICSWAP_V2_ROUTER_ADDRESS)) {
      transaction.user = getOrCreateUser(params.to).id;
    } else if (!params.sender.equals(MAGICSWAP_V2_ROUTER_ADDRESS)) {
      transaction.user = getOrCreateUser(params.sender).id;
    } else {
      transaction.user = getOrCreateUser(event.transaction.from).id;
    }
  }
  transaction.pair = pair.id;
  transaction.amount0 = amount0;
  transaction.amount1 = amount1;
  transaction.amountUSD = amountUSD;
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

  token0.derivedMAGIC = token1.isMAGIC
    ? pair.reserve1.div(pair.reserve0)
    : getDerivedMagic(token0);
  token0.save();

  token1.derivedMAGIC = token0.isMAGIC
    ? pair.reserve0.div(pair.reserve1)
    : getDerivedMagic(token1);
  token1.save();

  const magicUSD = getMagicUSD();
  if (token0.derivedMAGIC > ZERO_BD) {
    pair.reserveUSD = pair.reserve0
      .times(token0.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
  } else if (token1.derivedMAGIC > ZERO_BD) {
    pair.reserveUSD = pair.reserve1
      .times(token1.derivedMAGIC)
      .times(TWO_BD)
      .times(magicUSD);
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

    // Confirm deposit user
    const transaction = getOrCreateTransaction(event);
    transaction.user = getOrCreateUser(params.to).id;
    transaction.save();
  } else if (
    params.to.equals(Address.zero()) &&
    params.from.equals(event.address)
  ) {
    // Burned
    pair.totalSupply = pair.totalSupply.minus(params.value);
    pair.save();
  } else if (params.to.equals(event.address)) {
    // First stage of a burn event
    // Confirm withdrawal user
    const transaction = getOrCreateTransaction(event);
    transaction.user = getOrCreateUser(params.from).id;
    transaction.save();
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
