import { Address, log, store } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../generated/Randomizer/Randomizer";
import { CorruptionRemoval, Seeded } from "../generated/schema";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const requestId = params._requestId.toString();

  if (
    !event.transaction.to ||
    (event.transaction.to as Address).notEqual(Address.zero())
  ) {
    log.debug("[randomizer] Skipping request from unrelated contract: {}", [
      requestId,
    ]);
    return;
  }

  const commitId = params._commitId.toString();
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
  const commitId = params._commitId.toString();

  const seeded = Seeded.load(commitId);
  if (!seeded) {
    log.debug("[randomizer] Skipping random seeded for unknown commit ID: {}", [
      commitId,
    ]);
    return;
  }

  for (let i = 0; i < seeded.requests.length; i++) {
    const requestId = seeded.requests[i];
    const request = CorruptionRemoval.load(requestId);
    if (!request) {
      log.error("[randomizer] Committing unknown request: {}", [requestId]);
      continue;
    }

    request.status = "Ready";
    request.save();
  }

  store.remove("Seeded", commitId);
}
