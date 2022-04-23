import { BigInt } from "@graphprotocol/graph-ts";

import { _Random, _Seeded } from "../../generated/schema";

export const getOrCreateRandom = (requestId: BigInt): _Random => {
  const id = requestId.toHexString();
  let random = _Random.load(id);

  if (!random) {
    random = new _Random(id);
    random.save();
  }

  return random;
};

export const getOrCreateSeeded = (commitId: BigInt): _Seeded => {
  const id = commitId.toHexString();
  let seeded = _Seeded.load(id);

  if (!seeded) {
    seeded = new _Seeded(id);
    seeded.randomIds = [];
    seeded.save();
  }

  return seeded;
};
