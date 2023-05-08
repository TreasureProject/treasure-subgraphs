import { log } from "@graphprotocol/graph-ts";

import {
  DefaultFeesSet,
  LpFeesSet,
  PairCreated,
  ProtocolFeeBeneficiarySet,
  ProtocolFeesSet,
  RoyaltiesFeesSet,
} from "../../generated/UniswapV2Factory/UniswapV2Factory";
import { Pair } from "../../generated/schema";
import { UniswapV2Pair } from "../../generated/templates";
import { ZERO_BD, ZERO_BI } from "../const";
import { ONE_BI } from "../const";
import { getOrCreateFactory, getOrCreateToken, isMagic } from "../helpers";
import { basisPointToBigDecimal } from "../utils";

export function handlePairCreated(event: PairCreated): void {
  const params = event.params;

  const factory = getOrCreateFactory();
  const token0 = getOrCreateToken(params.token0);
  const token1 = getOrCreateToken(params.token1);

  const pair = new Pair(params.pair);
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.totalSupply = ZERO_BI;
  pair.volume0 = ZERO_BD;
  pair.volume1 = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.txCount = ZERO_BI;
  pair.lpFee = factory.lpFee;
  pair.protocolFee = factory.protocolFee;
  pair.royaltiesFee = ZERO_BD;
  pair.save();

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

export function handleDefaultFeesSet(event: DefaultFeesSet): void {
  const params = event.params;
  const factory = getOrCreateFactory();
  factory.protocolFee = basisPointToBigDecimal(params.fees.protocolFee);
  factory.lpFee = basisPointToBigDecimal(params.fees.lpFee);
  factory.save();
}

export function handleProtocolFeeBeneficiarySet(
  event: ProtocolFeeBeneficiarySet
): void {
  const factory = getOrCreateFactory();
  factory.protocolFeeBeneficiary = event.params.beneficiary;
  factory.save();
}

export function handleLpFeesSet(event: LpFeesSet): void {
  const params = event.params;
  const pair = Pair.load(params.pair);
  if (!pair) {
    log.error("Error upading LP fees for unknown Pair: {}", [
      params.pair.toHexString(),
    ]);
    return;
  }

  if (params.overrideFee) {
    pair.lpFee = basisPointToBigDecimal(params.lpFee);
    pair.save();
  } else {
    const factory = getOrCreateFactory();
    pair.lpFee = factory.lpFee;
    pair.save();
  }
}

export function handleProtocolFeesSet(event: ProtocolFeesSet): void {
  const params = event.params;
  const pair = Pair.load(params.pair);
  if (!pair) {
    log.error("Error upading protocol fees for unknown Pair: {}", [
      params.pair.toHexString(),
    ]);
    return;
  }

  if (params.overrideFee) {
    pair.protocolFee = basisPointToBigDecimal(params.protocolFee);
    pair.save();
  } else {
    const factory = getOrCreateFactory();
    pair.protocolFee = factory.protocolFee;
    pair.save();
  }
}

export function handleRoyaltiesFeesSet(event: RoyaltiesFeesSet): void {
  const params = event.params;
  const pair = Pair.load(params.pair);
  if (!pair) {
    log.error("Error upading royalties fees for unknown Pair: {}", [
      params.pair.toHexString(),
    ]);
    return;
  }

  pair.royaltiesFee = basisPointToBigDecimal(params.royaltiesFee);
  pair.royaltiesBeneficiary = params.beneficiary;
  pair.save();
}
