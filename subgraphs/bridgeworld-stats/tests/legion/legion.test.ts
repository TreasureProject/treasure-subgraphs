import { assert, clearStore, test } from "matchstick-as";

import { LEGION_ADDRESS } from "@treasure/constants";

import { handleLegionCreated } from "../../src/mappings/legion";
import { createLegionCreatedEvent } from "./utils";

const LEGION_ENTITY_TYPE = "Legion";

test("legion is created", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(1, 0, 4);
  handleLegionCreated(legionCreatedEvent);

  // Assert legion was created
  const id = `${LEGION_ADDRESS.toHexString()}-0x1`;
  assert.fieldEquals(LEGION_ENTITY_TYPE, id, "generation", "Genesis");
  assert.fieldEquals(LEGION_ENTITY_TYPE, id, "rarity", "Common");
  assert.fieldEquals(LEGION_ENTITY_TYPE, id, "name", "Genesis Common");
});

test("legion with custom name is created", () => {
  clearStore();

  const legionCreatedEvent = createLegionCreatedEvent(3476, 0, 0);
  handleLegionCreated(legionCreatedEvent);

  // Assert clocksnatcher was created
  const id = `${LEGION_ADDRESS.toHexString()}-0xd94`;
  assert.fieldEquals(LEGION_ENTITY_TYPE, id, "name", "Clocksnatcher");
});
