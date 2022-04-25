import { assert, clearStore, test } from "matchstick-as/assembly";

import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";

import { handleUpdateCollectionOwnerFee } from "../src/mapping";
import { createUpdateCollectionOwnerFee } from "./utils";

const FEE_ENTITY_TYPE = "Fee";

test("fee is setup correctly", () => {
  clearStore();

  const updateFeeEvent = createUpdateCollectionOwnerFee(
    SMOL_BRAINS_ADDRESS,
    500
  );

  handleUpdateCollectionOwnerFee(updateFeeEvent);

  const id = SMOL_BRAINS_ADDRESS.toHexString();

  assert.fieldEquals(FEE_ENTITY_TYPE, id, "collection", id);
  assert.fieldEquals(FEE_ENTITY_TYPE, id, "fee", "0.05");
});
