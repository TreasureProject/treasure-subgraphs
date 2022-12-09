import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  CORRUPTION_CRYPTS_ADDRESS,
  CORRUPTION_REMOVAL_ADDRESS,
} from "@treasure/constants";

import {
  CorruptionCrypts,
  CorruptionCrypts__generateBoardTreasureResultValue0Struct,
  CorruptionCrypts__generateTemplePositionsResultValue0Struct,
} from "../generated/Randomizer/CorruptionCrypts";
import {
  RandomRequest,
  RandomSeeded,
} from "../generated/Randomizer/Randomizer";
import { Removal, Seeded } from "../generated/schema";
import { getOrCreateBoardTreasureFragment, getOrCreateConfig } from "./helpers";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const requestId = Bytes.fromI32(params._requestId.toI32());

  if (
    !event.transaction.to ||
    ((event.transaction.to as Address).notEqual(CORRUPTION_REMOVAL_ADDRESS) &&
      (event.transaction.to as Address).notEqual(CORRUPTION_CRYPTS_ADDRESS))
  ) {
    log.debug("[randomizer] Skipping request from unrelated contract: {}", [
      requestId.toHexString(),
    ]);
    return;
  }

  const commitId = Bytes.fromI32(params._commitId.toI32());
  let seeded = Seeded.load(commitId);
  if (seeded) {
    seeded.requests = seeded.requests.concat([requestId]);
  } else {
    seeded = new Seeded(commitId);
    seeded.requests = [requestId];
  }

  seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;
  const commitId = Bytes.fromI32(params._commitId.toI32());

  const seeded = Seeded.load(commitId);
  if (!seeded) {
    log.debug("[randomizer] Skipping random seeded for unknown commit ID: {}", [
      commitId.toHexString(),
    ]);
    return;
  }

  for (let i = 0; i < seeded.requests.length; i++) {
    const requestId = seeded.requests[i];
    const config = getOrCreateConfig();
    if (
      config &&
      config.cryptsRequestId &&
      (config.cryptsRequestId as Bytes).equals(requestId)
    ) {
      const contract = CorruptionCrypts.bind(CORRUPTION_CRYPTS_ADDRESS);
      const templePositionsData = contract.try_generateTemplePositions();
      if (templePositionsData.reverted) {
        log.error("[randomizer] Error reading board temple positions: {}", [
          requestId.toHexString(),
        ]);
        continue;
      }

      processTemplePositions(templePositionsData.value);

      const boardTreasureData = contract.try_generateBoardTreasure();
      if (boardTreasureData.reverted) {
        log.error("[randomizer] Error reading board Treasure position: {}", [
          requestId.toHexString(),
        ]);
        continue;
      }

      processBoardTreasure(boardTreasureData.value);

      continue;
    }

    const removal = Removal.load(requestId);
    if (!removal) {
      log.error("[randomizer] Committing unknown request: {}", [
        requestId.toHexString(),
      ]);
      continue;
    }

    removal.status = "Ready";
    removal.save();
  }

  store.remove("Seeded", commitId.toHexString());
}

const processTemplePositions = (
  params: CorruptionCrypts__generateTemplePositionsResultValue0Struct[]
): void => {};

const processBoardTreasure = (
  params: CorruptionCrypts__generateBoardTreasureResultValue0Struct
): void => {
  const boardTreasureFragment = getOrCreateBoardTreasureFragment();
  boardTreasureFragment.tokenId = params.correspondingId;
  boardTreasureFragment.positionX = params.coordinate.x;
  boardTreasureFragment.positionY = params.coordinate.y;
  boardTreasureFragment.save();
};
