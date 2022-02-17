import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { LegionInfo, SummonFatigue } from "../../generated/schema";

class Fatigue {
  constructor(public id: string, public cooldown: BigInt) {}
}

export function checkSummonFatigue(timestamp: i64): void {
  let fatigue = SummonFatigue.load("all");

  // No summons have finished yet.
  if (!fatigue) {
    return;
  }

  let now = BigInt.fromString(new Date(timestamp).getTime().toString());

  // We've checked in the past 5 minutes.
  if (fatigue.timestamp.gt(now)) {
    return;
  }

  let length = fatigue.data.length;
  let index = 0;

  for (; index < length; index++) {
    let parts = fatigue.data[index].split(",");
    let id = parts[0];
    let cooldown = BigInt.fromString(parts[1]);

    if (cooldown.gt(now)) {
      break;
    }

    let metadata = LegionInfo.load(id);

    if (!metadata) {
      log.warning("[check-fatigue] unknown legion: {}", [id]);

      continue;
    }

    fatigue.timestamp = cooldown.plus(BigInt.fromI32(300_000));

    metadata.cooldown = null;
    metadata.save();
  }

  // Nothing to do
  if (index == 0) {
    return;
  }

  if (index == fatigue.data.length) {
    // All have been cleared.
    store.remove("SummonFatigue", "all");

    return;
  }

  fatigue.data = fatigue.data.slice(index);
  fatigue.save();
}
