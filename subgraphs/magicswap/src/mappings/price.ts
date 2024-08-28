import { AnswerUpdated } from "../../generated/ChainlinkAggregator/ChainlinkAggregator";
import { getOrCreateGlobal } from "../helpers";
import { amountToBigDecimal } from "../utils";

export function handleMagicUSDUpdated(event: AnswerUpdated): void {
  const global = getOrCreateGlobal();
  global.magicUSD = amountToBigDecimal(event.params.current, 8);
  global.save();
}
