import { Bundle } from "../../generated/schema";
import { ZERO_BD } from "../helpers/constants";

export function getBundle(): Bundle {
  let bundle = Bundle.load("1");

  if (bundle === null) {
    bundle = new Bundle("1");
    bundle.ethPrice = ZERO_BD;
    bundle.save();
  }

  return bundle as Bundle;
}
