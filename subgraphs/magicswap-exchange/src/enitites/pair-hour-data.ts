import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import { Pair, PairHourData } from "../../generated/schema";
import { ZERO_BD, ZERO_BI } from "../helpers/constants";

export function updatePairHourData(event: ethereum.Event): PairHourData {
  const timestamp = event.block.timestamp.toI32();

  const hour = timestamp / 3600;

  const date = hour * 3600;

  const id = event.address
    .toHex()
    .concat("-")
    .concat(BigInt.fromI32(hour).toString());

  const pair = Pair.load(event.address.toHex()) as Pair;

  let pairHourData = PairHourData.load(id);

  if (pairHourData === null) {
    pairHourData = new PairHourData(id);
    pairHourData.date = date;
    pairHourData.pair = pair.id;
    pairHourData.txCount = ZERO_BI;
  }

  pairHourData.reserve0 = pair.reserve0;
  pairHourData.reserve1 = pair.reserve1;
  pairHourData.reserveUSD = pair.reserveUSD;
  pairHourData.volumeToken0 = ZERO_BD;
  pairHourData.volumeToken1 = ZERO_BD;
  pairHourData.volumeUSD = ZERO_BD;
  pairHourData.txCount = pairHourData.txCount.plus(BigInt.fromI32(1));

  pairHourData.save();

  return pairHourData as PairHourData;
}
