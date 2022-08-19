import { Address, ethereum } from "@graphprotocol/graph-ts";

import { MAGICSWAP_FACTORY_ADDRESS } from "@treasure/constants";

import { DayData, Factory } from "../../generated/schema";

export function getFactory(id: Address = MAGICSWAP_FACTORY_ADDRESS): Factory {
  let factory = Factory.load(id.toHex());

  if (factory === null) {
    factory = new Factory(id.toHex());
    factory.save();
  }

  return factory as Factory;
}

export function getDayData(event: ethereum.Event): DayData {
  const id = event.block.timestamp.toI32() / 86400;

  let dayData = DayData.load(id.toString());

  if (dayData === null) {
    const factory = getFactory();
    dayData = new DayData(id.toString());
    dayData.factory = factory.id;
    dayData.date = id * 86400;
    dayData.liquidityUSD = factory.liquidityUSD;
    dayData.liquidityETH = factory.liquidityETH;
    dayData.txCount = factory.txCount;
  }

  return dayData as DayData;
}

export function updateDayData(event: ethereum.Event): DayData {
  const factory = getFactory();

  const dayData = getDayData(event);

  dayData.liquidityUSD = factory.liquidityUSD;
  dayData.liquidityETH = factory.liquidityETH;
  dayData.txCount = factory.txCount;

  dayData.save();

  return dayData as DayData;
}
