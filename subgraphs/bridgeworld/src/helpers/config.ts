import { BigInt } from "@graphprotocol/graph-ts";

import { _BlockConfig } from "../../generated/schema";

export const getOrCreateBlockConfig = (): _BlockConfig => {
  let blockConfig = _BlockConfig.load("only");
  if (!blockConfig) {
    blockConfig = new _BlockConfig("only");
    blockConfig.save();
  }

  return blockConfig;
};

export const setQuestingXpGainedBlockNumberIfEmpty = (
  blockNumber: BigInt
): void => {
  const blockConfig = getOrCreateBlockConfig();
  if (!blockConfig.questingXpGainedBlockNumber) {
    blockConfig.questingXpGainedBlockNumber = blockNumber;
    blockConfig.save();
  }
};

export const isQuestingXpGainedEnabled = (blockNumber: BigInt): boolean => {
  const blockConfig = getOrCreateBlockConfig();
  if (!blockConfig.questingXpGainedBlockNumber) {
    return false;
  }

  return blockNumber.ge(blockConfig.questingXpGainedBlockNumber as BigInt);
};

export const setCraftingXpGainedBlockNumberIfEmpty = (
  blockNumber: BigInt
): void => {
  const blockConfig = getOrCreateBlockConfig();
  if (!blockConfig.craftingXpGainedBlockNumber) {
    blockConfig.craftingXpGainedBlockNumber = blockNumber;
    blockConfig.save();
  }
};

export const isCraftingXpGainedEnabled = (blockNumber: BigInt): boolean => {
  const blockConfig = getOrCreateBlockConfig();
  if (!blockConfig.craftingXpGainedBlockNumber) {
    return false;
  }

  return blockNumber.ge(blockConfig.craftingXpGainedBlockNumber as BigInt);
};
