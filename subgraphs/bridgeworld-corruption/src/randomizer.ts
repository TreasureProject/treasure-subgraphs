import { Address, Bytes, log, store } from "@graphprotocol/graph-ts";

import {
  RandomRequest,
  RandomSeeded,
} from "../generated/Randomizer/Randomizer";
import { CorruptionRemoval, Seeded } from "../generated/schema";

export function handleRandomRequest(event: RandomRequest): void {
  const params = event.params;
  const requestId = Bytes.fromI32(params._requestId.toI32());

  if (
    !event.transaction.to ||
    (event.transaction.to as Address).notEqual(Address.zero())
  ) {
    log.debug("[randomizer] Skipping request from unrelated contract: {}", [
      requestId.toString(),
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
      commitId.toString(),
    ]);
    return;
  }

  for (let i = 0; i < seeded.requests.length; i++) {
    const requestId = seeded.requests[i];
    const request = CorruptionRemoval.load(requestId);
    if (!request) {
      log.error("[randomizer] Committing unknown request: {}", [
        requestId.toString(),
      ]);
      continue;
    }

    request.status = "Ready";
    request.save();
  }

  store.remove("Seeded", commitId.toHexString());
}
