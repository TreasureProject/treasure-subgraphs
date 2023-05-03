import { AnswerUpdated } from "../../generated/ChainlinkAggregator/ChainlinkAggregator";
import { getOrCreateFactory } from "../helpers";
import { amountToBigDecimal } from "../utils";

export function handleMagicUSDUpdated(event: AnswerUpdated): void {
  const factory = getOrCreateFactory();
  factory.magicUSD = amountToBigDecimal(event.params.current, 8);
  factory.save();
}
