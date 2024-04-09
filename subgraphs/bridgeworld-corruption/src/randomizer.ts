import { BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";

import { CORRUPTION_CRYPTS_ADDRESS } from "@treasure/constants";

import {
  CorruptionCrypts,
  CorruptionCrypts__generateBoardTreasureResultValue0Struct,
  CorruptionCrypts__generateTemplePositionsResultValue0Struct,
} from "../generated/Randomizer/CorruptionCrypts";
import {
  RandomRequest as RandomRequested,
  RandomSeeded,
} from "../generated/Randomizer/Randomizer";
import {
  CryptsTemple,
  RandomCommit,
  RandomRequest,
  Removal,
} from "../generated/schema";
import {
  bytesFromBigInt,
  getOrCreateBoardTreasureFragment,
  getOrCreateConfig,
} from "./helpers";

export function handleRandomRequest(event: RandomRequested): void {
  const params = event.params;

  const commitId = bytesFromBigInt(params._commitId);
  let commit = RandomCommit.load(commitId);
  if (!commit) {
    commit = new RandomCommit(commitId);
    commit.commitId = params._commitId;
    commit.save();
  }

  const request = new RandomRequest(bytesFromBigInt(params._requestId));
  request.requestId = params._requestId;
  request.commit = commit.id;
  request.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
  const params = event.params;

  // Find the commit for this seeded event
  const commit = RandomCommit.load(bytesFromBigInt(params._commitId));
  if (!commit) {
    log.error("[randomizer] Unknown commit ID: {}", [
      params._commitId.toString(),
    ]);
    return;
  }

  // Load the commit's related requests
  const requests = commit.requests.load();

  // Handle each of the requests
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];

    // Is this the Crypts random request getting seeded?
    const config = getOrCreateConfig();
    if (config.cryptsRequestId.equals(request.requestId)) {
      const contract = CorruptionCrypts.bind(CORRUPTION_CRYPTS_ADDRESS);

      // Read the Crypts temple positions from the contract
      const templePositionsData = contract.try_generateTemplePositions();
      if (templePositionsData.reverted) {
        log.error("[randomizer] Error reading board temple positions: {}", [
          request.requestId.toString(),
        ]);
        continue;
      }
      processTemplePositions(templePositionsData.value);

      // Read the Treasure Fragment position from the contract
      const boardTreasureData = contract.try_generateBoardTreasure();
      if (boardTreasureData.reverted) {
        log.error("[randomizer] Error reading board Treasure position: {}", [
          request.requestId.toString(),
        ]);
        continue;
      }
      processBoardTreasure(boardTreasureData.value);

      // Update the Crypts config and move to the next request
      config.cryptsRoundStarting = false;
      config.save();
      continue;
    }

    // Is this a Corruption removal request getting seeded?
    const removal = Removal.load(request.id);
    if (!removal) {
      log.debug("[randomizer] Skipping unknown request: {}", [
        request.requestId.toString(),
      ]);
      continue;
    }

    // Mark removal request as ready and move to the next request
    removal.status = "Ready";
    removal.save();
  }

  // Delete random requests now that we're done processing them
  for (let i = 0; i < requests.length; i++) {
    store.remove("RandomRequest", requests[i].id.toHexString());
  }

  // Delete random commit now that we're done processing it
  store.remove("RandomCommit", commit.id.toHexString());
}

const processTemplePositions = (
  params: CorruptionCrypts__generateTemplePositionsResultValue0Struct[]
): void => {
  for (let i = 0; i < params.length; i += 1) {
    const temple = CryptsTemple.load(Bytes.fromI32(params[i].templeId));
    if (!temple) {
      log.error("[randomizer] Processing position for unknown temple: {}", [
        params[i].templeId.toString(),
      ]);
      continue;
    }

    temple.address = params[i].harvesterAddress;
    temple.positionX = params[i].coordinate.x;
    temple.positionY = params[i].coordinate.y;
    temple.save();
  }
};

const processBoardTreasure = (
  params: CorruptionCrypts__generateBoardTreasureResultValue0Struct
): void => {
  const boardTreasureFragment = getOrCreateBoardTreasureFragment();
  boardTreasureFragment.tokenId = params.correspondingId;
  boardTreasureFragment.positionX = params.coordinate.x;
  boardTreasureFragment.positionY = params.coordinate.y;
  boardTreasureFragment.numClaimed = params.numClaimed;
  boardTreasureFragment.maxSupply = params.maxSupply;
  boardTreasureFragment.save();
};
