import { BigDecimal, log } from "@graphprotocol/graph-ts";

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
import { getOrCreateFactory, getOrCreateToken } from "../helpers";
import { basisPointToBigDecimal } from "../utils";

const MAX_FEE = BigDecimal.fromString("0.5");

const updateTotalFee = (pair: Pair): void => {
  const totalFee = pair.lpFee.plus(pair.protocolFee).plus(pair.royaltiesFee);
  pair.totalFee = totalFee.ge(MAX_FEE) ? MAX_FEE : totalFee;
};

export function handlePairCreated(event: PairCreated): void {
  const params = event.params;

  const factory = getOrCreateFactory(event.address);
  const token0 = getOrCreateToken(params.token0);
  const token1 = getOrCreateToken(params.token1);

  const pair = new Pair(params.pair);
  pair.factory = factory.id;
  pair.version = factory.version;
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
  updateTotalFee(pair);
  pair.save();

  factory.pairCount = factory.pairCount.plus(ONE_BI);
  factory.save();

  if (token0.isMAGIC) {
    token1.magicPairs = token1.magicPairs.concat([pair.id]);
    token1.save();
  } else if (token1.isMAGIC) {
    token0.magicPairs = token0.magicPairs.concat([pair.id]);
    token0.save();
  }

  UniswapV2Pair.create(params.pair);
}

export function handleDefaultFeesSet(event: DefaultFeesSet): void {
  const params = event.params;
  const factory = getOrCreateFactory(event.address);
  factory.protocolFee = basisPointToBigDecimal(params.fees.protocolFee);
  factory.lpFee = basisPointToBigDecimal(params.fees.lpFee);
  factory.save();
}

export function handleProtocolFeeBeneficiarySet(
  event: ProtocolFeeBeneficiarySet
): void {
  const factory = getOrCreateFactory(event.address);
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
  } else {
    const factory = getOrCreateFactory(event.address);
    pair.lpFee = factory.lpFee;
  }

  updateTotalFee(pair);
  pair.save();
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
  } else {
    const factory = getOrCreateFactory(event.address);
    pair.protocolFee = factory.protocolFee;
  }

  updateTotalFee(pair);
  pair.save();
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
  updateTotalFee(pair);
  pair.save();
}
