import { assert, describe, test } from "matchstick-as";

import { MAGICSWAP_V2_FACTORY_ADDRESS } from "@treasure/constants";

import { handleMagicUSDUpdated } from "../src/mappings/price";
import { createAnswerUpdatedEvent } from "./helpers/price";

describe("handleMagicUSDUpdated()", () => {
  test("should update MAGIC/USD price", () => {
    handleMagicUSDUpdated(createAnswerUpdatedEvent());

    assert.fieldEquals(
      "Factory",
      MAGICSWAP_V2_FACTORY_ADDRESS.toHexString(),
      "magicUSD",
      "1.5"
    );
  });
});
