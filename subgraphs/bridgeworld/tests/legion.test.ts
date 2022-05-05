import { assert, clearStore, test } from "matchstick-as/assembly";

import { Address } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import { LEGION_IPFS } from "../src/helpers/index";
import { handleTransferSingle } from "../src/mappings/legacy-legion-genesis";
import { handleLegionCreated, handleTransfer } from "../src/mappings/legion";
import {
  handlePilgrimagesFinished,
  handlePilgrimagesStarted,
} from "../src/mappings/pilgrimage";
import {
  LEGACY_LEGION_GENESIS_ADDRESS,
  LEGION_INFO_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
  createLegacyLegionGenesisTransferEvent,
  createLegionCreatedEvent,
  createLegionTransferEvent,
  createPilgrimagesFinishedEvent,
  createPilgrimagesStartedEvent,
} from "./helpers/index";

// PilgrimageId = 7 in production
test("legion metadata is correct for pilgrimaged riverman", () => {
  clearStore();

  handleTransferSingle(
    createLegacyLegionGenesisTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      134
    )
  );

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    USER_ADDRESS,
    LEGACY_LEGION_GENESIS_ADDRESS,
    1643659676,
    [134],
    [1],
    [7]
  );

  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    7
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 7, 0, 6, 2);

  handleLegionCreated(legionCreatedEvent);

  const pilgrimagesFinishedEvent = createPilgrimagesFinishedEvent(
    USER_ADDRESS,
    [7],
    [7]
  );

  handlePilgrimagesFinished(pilgrimagesFinishedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x7`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    `${LEGION_IPFS}/Genesis/Special/Riverman/4D.jpg`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Genesis Special");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "generation", "0");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "Special");

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questing", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "type", "Genesis");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "Special");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Riverman");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "boost", "0.75");
});

// PilgrimageId = 1 in production
test("legion metadata is correct for pilgrimaged common legion", () => {
  clearStore();

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    USER_ADDRESS,
    LEGACY_LEGION_GENESIS_ADDRESS,
    1643659676,
    [70],
    [1],
    [1]
  );

  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 1, 1, 4);

  handleLegionCreated(legionCreatedEvent);

  const pilgrimagesFinishedEvent = createPilgrimagesFinishedEvent(
    USER_ADDRESS,
    [1],
    [1]
  );

  handlePilgrimagesFinished(pilgrimagesFinishedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    `${LEGION_IPFS}/Auxiliary/Common/Siege/1A.jpg`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Auxiliary Common");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "Common");

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questing", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "type", "Auxiliary");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "Common");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Siege");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "boost", "0.05");
});

// PilgrimageId = 11 in production
test("legion metadata is correct for pilgrimaged common 5", () => {
  clearStore();

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    USER_ADDRESS,
    LEGACY_LEGION_GENESIS_ADDRESS,
    1643659676,
    [60],
    [1],
    [11]
  );

  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(USER_ADDRESS, 1, 0, 1, 4);

  handleLegionCreated(legionCreatedEvent);

  const pilgrimagesFinishedEvent = createPilgrimagesFinishedEvent(
    USER_ADDRESS,
    [1],
    [11]
  );

  handlePilgrimagesFinished(pilgrimagesFinishedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    `${LEGION_IPFS}/Genesis/Common/Siege/1A.jpg`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Genesis Common");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "Common");

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questing", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "type", "Genesis");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "Common");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Siege");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "boost", "0.5");
});

// PilgrimageId = 3109 in production
test("legion metadata is correct for pilgrimaged clocksnatcher", () => {
  clearStore();

  handleTransferSingle(
    createLegacyLegionGenesisTransferEvent(
      Address.zero().toHexString(),
      USER_ADDRESS,
      55
    )
  );

  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    USER_ADDRESS,
    LEGACY_LEGION_GENESIS_ADDRESS,
    1643659676,
    [55],
    [1],
    [3109]
  );

  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  const mintEvent = createLegionTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    3476
  );

  handleTransfer(mintEvent);

  const legionCreatedEvent = createLegionCreatedEvent(
    USER_ADDRESS,
    3476,
    0,
    9,
    0
  );

  handleLegionCreated(legionCreatedEvent);

  const pilgrimagesFinishedEvent = createPilgrimagesFinishedEvent(
    USER_ADDRESS,
    [3476],
    [3109]
  );

  handlePilgrimagesFinished(pilgrimagesFinishedEvent);

  const id = `${LEGION_ADDRESS.toHexString()}-0xd94`;

  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "category", "Legion");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    `${LEGION_IPFS}/Genesis/Legendary/Clocksnatcher.jpg`
  );
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Clocksnatcher");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "rarity", "Legendary");

  const metadata = `${id}-metadata`;

  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questing", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "questingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "type", "Genesis");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "summons", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "crafting", "1");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "craftingXp", "0");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "rarity", "Legendary");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "role", "Origin");
  assert.fieldEquals(LEGION_INFO_ENTITY_TYPE, metadata, "boost", "6.0");
});
