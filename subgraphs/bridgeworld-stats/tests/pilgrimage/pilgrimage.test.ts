import { assert, clearStore, test } from "matchstick-as/assembly/index";

import { PILGRIMAGE_ADDRESS, createPilgrimagesStartedEvent, createPilgrimagesFinishedEvent } from "./utils";
import { handlePilgrimagesStarted, handlePilgrimagesFinished } from "../../src/mappings/pilgrimage";

const PILGRIMAGE_ENTITY_TYPE = "Pilgrimage";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";
const LEGION_ADDRESS = "0x96f791c0c11baee97526d5a9674494805afbec1c";

test("current and total pilgrimages counts are stored", () => {
  const pilgrimagesStartedEvent = createPilgrimagesStartedEvent(
    USER_ADDRESS,
    LEGION_ADDRESS,
    1643659676,
    [1, 2, 3],
    [1, 2, 1],
    [0, 1, 2]
  );

  handlePilgrimagesStarted(pilgrimagesStartedEvent);

  // All pilgrimages are in progress
  assert.fieldEquals(PILGRIMAGE_ENTITY_TYPE, PILGRIMAGE_ADDRESS, "current", "4");
  assert.fieldEquals(PILGRIMAGE_ENTITY_TYPE, PILGRIMAGE_ADDRESS, "total", "4");

  const pilgrimagesFinishedEvent = createPilgrimagesFinishedEvent(
    USER_ADDRESS,
    [1001, 1002],
    [0, 1]
  );

  handlePilgrimagesFinished(pilgrimagesFinishedEvent);

  // Two pilgrimages have ended
  assert.fieldEquals(PILGRIMAGE_ENTITY_TYPE, PILGRIMAGE_ADDRESS, "current", "2");
  assert.fieldEquals(PILGRIMAGE_ENTITY_TYPE, PILGRIMAGE_ADDRESS, "total", "4");
  
  clearStore();
});
