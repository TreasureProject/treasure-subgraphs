import { Bundle } from "../../generated/schema";

export function getBundle(): Bundle {
  let bundle = Bundle.load("1");

  if (bundle === null) {
    bundle = new Bundle("1");
    bundle.save();
  }

  return bundle as Bundle;
}
