import { BigInt, log } from "@graphprotocol/graph-ts";

import { ADVANCED_QUESTING_ADDRESS } from "@treasure/constants";

import { AdvancedQuesting } from "../../generated/Advanced Questing/AdvancedQuesting";
import { AdvancedQuest } from "../../generated/schema";

export function setQuestEndTime(
  quest: AdvancedQuest,
  legionId: BigInt
): boolean {
  const advancedQuesting = AdvancedQuesting.bind(ADVANCED_QUESTING_ADDRESS);
  const endTimeResult = advancedQuesting.try_endTimeForLegion(legionId);

  if (!endTimeResult.reverted) {
    quest.endTimestamp = endTimeResult.value.value0.times(BigInt.fromI32(1000));
    quest.stasisHitCount = endTimeResult.value.value1;
    return true;
  } else {
    return false;
  }
}
