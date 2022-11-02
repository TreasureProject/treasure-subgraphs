import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import { CORRUPTION_REMOVAL_ADDRESS } from "@treasure/constants";

import {
  RandomRequest,
  RandomSeeded,
} from "../generated/Randomizer/Randomizer";
import { Removal, Seeded } from "../generated/schema";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const requestId = Bytes.fromI32(params._requestId.toI32());

  if (
    !event.transaction.to ||
    (event.transaction.to as Address).notEqual(CORRUPTION_REMOVAL_ADDRESS)
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
    const request = Removal.load(requestId);
    if (!request) {
      log.error("[randomizer] Committing unknown request: {}", [
        requestId.toHexString(),
      ]);
      continue;
    }

    request.status = "Ready";
    request.save();
  }

  store.remove("Seeded", commitId.toHexString());
}
