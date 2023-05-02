import { assert, describe, test } from "matchstick-as";

import { MAGICSWAP_V2_FACTORY_ADDRESS } from "@treasure/constants";

import { handleMagicUsdUpdated } from "../src/mappings/price";
import { createAnswerUpdatedEvent } from "./helpers/price";

describe("handleMagicUsdUpdated()", () => {
  test("should update MAGIC/USD price", () => {
    handleMagicUsdUpdated(createAnswerUpdatedEvent());

    assert.fieldEquals(
      "Factory",
      MAGICSWAP_V2_FACTORY_ADDRESS.toHexString(),
      "magicUsd",
      "1.5"
    );
  });
});
