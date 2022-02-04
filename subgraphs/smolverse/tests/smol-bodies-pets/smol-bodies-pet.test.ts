import { assert, clearStore, test } from "matchstick-as/assembly/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BODIES_PETS_ADDRESS } from "@treasure/constants";

import { createSmolPetMintEvent } from "./utils";
import { handleMint } from "../../src/mappings/smol-bodies-pet";
import { getTokenId } from "../../src/helpers/ids";

const SMOL_BODIES_PET_ENTITY_TYPE = "SmolBodiesPet";
const USER_ADDRESS = "0xb013abd83f0bd173e9f14ce7d6e420ad711483b4";

test("smol bodies pet is created with owner", () => {
  clearStore();

  const tokenId = 1;
  const smolPetMintEvent = createSmolPetMintEvent(
    USER_ADDRESS,
    tokenId,
    ""
  );

  handleMint(smolPetMintEvent);

  const id = getTokenId(SMOL_BODIES_PETS_ADDRESS, BigInt.fromI32(tokenId));
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "tokenId", "1");
  assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "owner", USER_ADDRESS);
  // assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "name", "#1");
  // assert.fieldEquals(SMOL_BODIES_PET_ENTITY_TYPE, id, "description", "Smol Pet Frens for Smol Bodies");
});
