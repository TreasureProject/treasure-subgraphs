import { BigInt } from "@graphprotocol/graph-ts";

import { Random, Seeded } from "../../generated/schema";

function getRandomId(requestId: BigInt): string {
  return requestId.toHexString();
}

export function getSeededId(commitId: BigInt): string {
  return commitId.toHexString();
}

export function getOrCreateRandom(requestId: BigInt): Random {
  const id = getRandomId(requestId);
  let random = Random.load(id);

  if (!random) {
    random = new Random(id);
    random.save();
  }

  return random;
}

export function getOrCreateSeeded(commitId: BigInt): Seeded {
  const id = getSeededId(commitId);
  let seeded = Seeded.load(id);

  if (!seeded) {
    seeded = new Seeded(id);
    seeded._randomIds = [];
    seeded.save();
  }

  return seeded;
}
