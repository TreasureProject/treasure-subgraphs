import { assert, clearStore, test } from "matchstick-as";

import { Address } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import {
  handleRecruitTypeChanged,
  handleRecruitXpChanged,
} from "../src/mappings/recruit";
import {
  LEGION_INFO_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "./helpers/constants";
import {
  createLegionCreatedEvent,
  createLegionTransferEvent,
} from "./helpers/legion";
import {
  createRecruitTypeChangedEvent,
  createRecruitXpChangedEvent,
} from "./helpers/recruit";

test("that recruit xp is changed", () => {
  clearStore();

  // Create Recruit
  const tokenId = 4357;
  handleTransfer(
    createLegionTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      tokenId
    )
  );
  handleLegionCreated(createLegionCreatedEvent(USER_ADDRESS, tokenId, 2, 0, 5));

  // Assert initial metadata values
  const metadata = `${LEGION_ADDRESS.toHexString()}-0x1105-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "0");

  // Update and assert XP
  handleRecruitXpChanged(createRecruitXpChangedEvent(tokenId, 1, 20));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "20");

  // Update and assert level
  handleRecruitXpChanged(createRecruitXpChangedEvent(tokenId, 2, 0));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitLevel", "2");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "recruitXp", "0");
});

test("that recruit type is changed", () => {
  clearStore();

  // Create Recruit
  const tokenId = 4357;
  handleTransfer(
    createLegionTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      tokenId
    )
  );
  handleLegionCreated(createLegionCreatedEvent(USER_ADDRESS, tokenId, 2, 0, 5));

  // Assert initial metadata values
  const id = `${LEGION_ADDRESS.toHexString()}-0x1105`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Recruit");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "generation", "2");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "None");

  const metadata = `${id}-metadata`;
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "None");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "None");

  // Update and assert types
  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 1));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "None");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Arcane");
  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 2));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Archery");
  handleRecruitTypeChanged(createRecruitTypeChangedEvent(tokenId, 3));
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Melee");
});
