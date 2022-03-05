import { BigInt } from "@graphprotocol/graph-ts";

import { Collection, Random, Seeded, Token } from "../../generated/schema";

export class RandomHelpers {
  public static getOrCreateRandom(requestId: BigInt): Random {
    const id = RandomHelpers.getRandomId(requestId);
    let random = Random.load(id);

    if (!random) {
      random = new Random(id);
      random.save();
    }

    return random;
  }

  public static getOrCreateSeeded(commitId: BigInt): Seeded {
    const id = RandomHelpers.getSeededId(commitId);
    let seeded = Seeded.load(id);

    if (!seeded) {
      seeded = new Seeded(id);
      seeded._randomIds = [];
      seeded.save();
    }

    return seeded;
  }

  public static getRandomId(requestId: BigInt): string {
    return requestId.toHexString();
  }

  public static getSeededId(commitId: BigInt): string {
    return commitId.toHexString();
  }
}
